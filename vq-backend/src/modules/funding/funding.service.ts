import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { fundingRequests, notifications, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { toNumber } from "../../utils/money.js";
import { uploadBufferToCloudinary } from "../../utils/upload.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { referralsService } from "../referrals/referrals.service.js";
import { communicationsService } from "../../services/communications/communications.service.js";

export const fundingService = {
  async create(userId: string, amount: number, proofFile?: Express.Multer.File) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new Error("User not found.");
    }

    const proof = proofFile
      ? await uploadBufferToCloudinary(proofFile.buffer, "vissquest/funding-proofs", proofFile.mimetype.startsWith("image/") ? "image" : "raw")
      : null;

    const [request] = await db
      .insert(fundingRequests)
      .values({
        userId,
        referenceId: user.referenceId ?? "PENDING_REF",
        amount: String(amount),
        proofUrl: proof?.secure_url,
        proofPublicId: proof?.public_id,
      })
      .returning();

    return request;
  },

  async listMine(userId: string) {
    return db.select().from(fundingRequests).where(eq(fundingRequests.userId, userId)).orderBy(desc(fundingRequests.createdAt));
  },

  async listModerationQueue() {
    return db
      .select()
      .from(fundingRequests)
      .orderBy(desc(fundingRequests.createdAt));
  },

  async approve(requestId: string, actorUserId: string) {
    const result = await db.transaction(async (tx) => {
      const [request] = await tx
        .select()
        .from(fundingRequests)
        .where(and(eq(fundingRequests.id, requestId), eq(fundingRequests.status, "pending")))
        .limit(1);

      if (!request) {
        throw new Error("Funding request not found.");
      }

      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, request.userId)).limit(1);
      if (!wallet) {
        throw new Error("Wallet not found.");
      }

      const nextBalance = toNumber(wallet.balance) + toNumber(request.amount);

      await tx
        .update(wallets)
        .set({ balance: String(nextBalance), updatedAt: new Date() })
        .where(eq(wallets.id, wallet.id));

      const [approvedRequest] = await tx
        .update(fundingRequests)
        .set({ status: "approved", reviewedByUserId: actorUserId, reviewedAt: new Date() })
        .where(eq(fundingRequests.id, requestId))
        .returning();

      await tx.insert(walletTransactions).values({
        userId: request.userId,
        walletId: wallet.id,
        type: "deposit",
        amount: request.amount,
        status: "approved",
        reference: request.referenceId,
        description: "Manual wallet funding approval",
      });

      const shouldNotifyFunding = await notificationsService.isEventEnabled("fundingApproved", tx);
      if (shouldNotifyFunding) {
        await tx.insert(notifications).values({
          userId: request.userId,
          title: "Wallet deposit approved",
          message: `Your wallet funding has been approved and your balance has been updated with NGN ${request.amount}.`,
          type: "funding",
        });
      }

      const referralResult = await referralsService.processApprovedFunding(tx, request.userId, toNumber(request.amount));

      return {
        success: true,
        fundingRequest: approvedRequest,
        walletBalance: nextBalance,
        notifiedUserId: request.userId,
        approvedAmount: toNumber(request.amount),
        referralRewardedUserId: referralResult?.referrerUserId ?? null,
        referralRewardAmount: referralResult?.rewardAmount ?? 0,
      };
    });

    void communicationsService.sendFundingApprovedEmail(result.notifiedUserId, result.approvedAmount);
    if (result.referralRewardedUserId && result.referralRewardAmount) {
      void communicationsService.sendReferralRewardEmail(
        result.referralRewardedUserId,
        result.referralRewardAmount,
      );
    }
    return {
      success: result.success,
      fundingRequest: result.fundingRequest,
      walletBalance: result.walletBalance,
    };
  },

  async reject(requestId: string, actorUserId: string) {
    const result = await db.transaction(async (tx) => {
      const [request] = await tx
        .select()
        .from(fundingRequests)
        .where(and(eq(fundingRequests.id, requestId), eq(fundingRequests.status, "pending")))
        .limit(1);

      if (!request) {
        throw new Error("Funding request not found.");
      }

      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, request.userId)).limit(1);
      if (!wallet) {
        throw new Error("Wallet not found.");
      }

      const [rejectedRequest] = await tx
        .update(fundingRequests)
        .set({ status: "rejected", reviewedByUserId: actorUserId, reviewedAt: new Date() })
        .where(eq(fundingRequests.id, requestId))
        .returning();

      await tx.insert(walletTransactions).values({
        userId: request.userId,
        walletId: wallet.id,
        type: "deposit",
        amount: request.amount,
        status: "rejected",
        reference: request.referenceId,
        description: "Manual wallet funding rejected",
      });

      await tx.insert(notifications).values({
        userId: request.userId,
        title: "Wallet deposit rejected",
        message: `Your payment of NGN ${request.amount} was rejected. Please check your transfer details and try again.`,
        type: "funding",
      });

      return { success: true, fundingRequest: rejectedRequest, notifiedUserId: request.userId, rejectedAmount: toNumber(request.amount) };
    });

    void communicationsService.sendFundingRejectedEmail(result.notifiedUserId, result.rejectedAmount);
    return {
      success: result.success,
      fundingRequest: result.fundingRequest,
    };
  },
};
