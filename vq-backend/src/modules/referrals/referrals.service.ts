import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import { notifications, referrals, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { toNumber } from "../../utils/money.js";
import { notificationsService } from "../notifications/notifications.service.js";

const REFERRAL_REWARD_AMOUNT = 500;
const REFERRAL_QUALIFYING_FUNDING = 500;

export const referralsService = {
  async attachReferral(refereeUserId: string, referralCode?: string | null) {
    const normalizedCode = referralCode?.trim().toUpperCase();
    if (!normalizedCode) {
      return null;
    }

    const [referrer] = await db
      .select()
      .from(users)
      .where(eq(users.referenceId, normalizedCode))
      .limit(1);

    if (!referrer || referrer.id === refereeUserId) {
      return null;
    }

    const [existingReferral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.refereeUserId, refereeUserId))
      .limit(1);

    if (existingReferral) {
      return existingReferral;
    }

    const [referral] = await db
      .insert(referrals)
      .values({
        referrerUserId: referrer.id,
        refereeUserId: refereeUserId,
        referralCode: normalizedCode,
      })
      .returning();

    return referral;
  },

  async getSummary(userId: string) {
    const referralRows = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerUserId, userId))
      .orderBy(desc(referrals.createdAt));

    const refereeIds = referralRows.map((referral) => referral.refereeUserId);
    const refereeRows = refereeIds.length
      ? await db.select().from(users).where(inArray(users.id, refereeIds))
      : [];

    const refereesById = new Map(refereeRows.map((user) => [user.id, user]));
    const [referrer] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return {
      referralCode: referrer?.referenceId ?? "PENDING_REF",
      totalReferrals: referralRows.length,
      successfulReferrals: referralRows.filter((referral) => referral.status === "rewarded").length,
      totalRewardsEarned: referralRows.reduce((sum, referral) => {
        return referral.status === "rewarded" ? sum + toNumber(referral.rewardAmount) : sum;
      }, 0),
      recentActivity: referralRows.slice(0, 5).map((referral) => ({
        id: referral.id,
        referenceId: refereesById.get(referral.refereeUserId)?.referenceId ?? "PENDING_REF",
        status: referral.status,
        rewardAmount: toNumber(referral.rewardAmount),
        createdAt: referral.createdAt,
        rewardedAt: referral.rewardedAt,
      })),
    };
  },

  async processApprovedFunding(tx: any, refereeUserId: string, approvedAmount: number) {
    const [referral] = await tx
      .select()
      .from(referrals)
      .where(eq(referrals.refereeUserId, refereeUserId))
      .limit(1);

    if (!referral || referral.status === "rewarded") {
      return null;
    }

    const nextQualifiedFunding = toNumber(referral.qualifyingFundingTotal) + approvedAmount;
    const qualifiesForReward = nextQualifiedFunding >= REFERRAL_QUALIFYING_FUNDING;

    if (!qualifiesForReward) {
      await tx
        .update(referrals)
        .set({
          qualifyingFundingTotal: String(nextQualifiedFunding),
          updatedAt: new Date(),
        })
        .where(eq(referrals.id, referral.id));
      return null;
    }

    const [referrerWallet] = await tx
      .select()
      .from(wallets)
      .where(eq(wallets.userId, referral.referrerUserId))
      .limit(1);
    const [referee] = await tx.select().from(users).where(eq(users.id, refereeUserId)).limit(1);

    if (!referrerWallet) {
      throw new Error("Referrer wallet not found.");
    }

    const nextBalance = toNumber(referrerWallet.balance) + REFERRAL_REWARD_AMOUNT;

    await tx
      .update(wallets)
      .set({ balance: String(nextBalance), updatedAt: new Date() })
      .where(eq(wallets.id, referrerWallet.id));

    await tx.insert(walletTransactions).values({
      userId: referral.referrerUserId,
      walletId: referrerWallet.id,
      type: "referral_reward",
      amount: String(REFERRAL_REWARD_AMOUNT),
      status: "completed",
      reference: referee?.referenceId ?? referral.referralCode,
      description: `Referral reward for ${referee?.referenceId ?? "new signup"}`,
    });

    await tx
      .update(referrals)
      .set({
        qualifyingFundingTotal: String(nextQualifiedFunding),
        status: "rewarded",
        qualifiedAt: referral.qualifiedAt ?? new Date(),
        rewardedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(referrals.id, referral.id));

    const shouldNotify = await notificationsService.isEventEnabled("referralReward", tx);
    if (shouldNotify) {
      await tx.insert(notifications).values({
        userId: referral.referrerUserId,
        title: "Referral reward credited",
        message: `You earned NGN ${REFERRAL_REWARD_AMOUNT} because ${referee?.referenceId ?? "your referral"} funded their wallet.`,
        type: "referral",
      });
    }

    return {
      rewardAmount: REFERRAL_REWARD_AMOUNT,
      referralId: referral.id,
    };
  },
};
