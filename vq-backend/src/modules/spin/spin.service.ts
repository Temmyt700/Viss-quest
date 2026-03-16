import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  spinHistory,
  spinRewards,
  spinSettings,
  users,
  walletTransactions,
  wallets,
} from "../../db/schema/index.js";
import { toNumber } from "../../utils/money.js";
import { pickRandomItem } from "../../utils/random.js";
import { getUtcDayStart, isSameUtcDay } from "../../utils/time.js";

const DEFAULT_SPIN_SETTINGS = {
  spinCost: 15,
  maxDailyPayout: 5000,
  maxSingleReward: 1000,
  dailySpinLimit: 1,
};

const parseSpinSettings = (settings?: typeof spinSettings.$inferSelect | null) => ({
  id: settings?.id ?? null,
  spinCost: settings ? toNumber(settings.spinCost) : DEFAULT_SPIN_SETTINGS.spinCost,
  maxDailyPayout: settings ? toNumber(settings.maxDailyPayout) : DEFAULT_SPIN_SETTINGS.maxDailyPayout,
  maxSingleReward: settings ? toNumber(settings.maxSingleReward) : DEFAULT_SPIN_SETTINGS.maxSingleReward,
  dailySpinLimit: settings?.dailySpinLimit ?? DEFAULT_SPIN_SETTINGS.dailySpinLimit,
});

type SpinSettingsClient = Pick<typeof db, "select" | "insert">;

const getOrCreateSettings = async (client: SpinSettingsClient = db) => {
  const [existing] = await client.select().from(spinSettings).limit(1);
  if (existing) {
    return existing;
  }

  const [created] = await client.insert(spinSettings).values({
    spinCost: String(DEFAULT_SPIN_SETTINGS.spinCost),
    maxDailyPayout: String(DEFAULT_SPIN_SETTINGS.maxDailyPayout),
    maxSingleReward: String(DEFAULT_SPIN_SETTINGS.maxSingleReward),
    dailySpinLimit: DEFAULT_SPIN_SETTINGS.dailySpinLimit,
  }).returning();

  return created;
};

export const spinService = {
  async getConfig() {
    const settings = parseSpinSettings(await getOrCreateSettings());
    const rewards = await db.select().from(spinRewards).orderBy(spinRewards.createdAt);

    return {
      ...settings,
      rewards: rewards.map((reward) => ({
        ...reward,
        rewardAmount: toNumber(reward.rewardAmount),
      })),
    };
  },

  async getStatus(userId: string) {
    const config = await this.getConfig();
    const [latest] = await db
      .select()
      .from(spinHistory)
      .where(eq(spinHistory.userId, userId))
      .orderBy(desc(spinHistory.spinDate))
      .limit(1);

    return {
      ...config,
      hasSpunToday: latest ? isSameUtcDay(new Date(latest.spinDate), new Date()) : false,
    };
  },

  async spin(userId: string) {
    return db.transaction(async (tx) => {
      // A per-user advisory lock ensures only one spin request can be processed
      // for a user at a time, even if the client spams the endpoint rapidly.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

      const settingsRow = await getOrCreateSettings(tx);
      const settings = parseSpinSettings(settingsRow);
      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!wallet || !user) {
        throw new Error("User wallet not found.");
      }

      const todayStart = getUtcDayStart();
      const todaySpins = await tx
        .select()
        .from(spinHistory)
        .where(and(eq(spinHistory.userId, userId), gte(spinHistory.spinDate, todayStart)));

      if (todaySpins.length >= settings.dailySpinLimit) {
        throw new Error("You have already used your spin limit for today.");
      }

      if (toNumber(wallet.balance) < settings.spinCost) {
        throw new Error("Insufficient wallet balance.");
      }

      const rewards = await tx.select().from(spinRewards).where(eq(spinRewards.isActive, true));
      if (!rewards.length) {
        throw new Error("Spin rewards are not configured.");
      }

      const eligibleRewards = [];
      for (const reward of rewards) {
        const rewardAmount = Math.min(toNumber(reward.rewardAmount), settings.maxSingleReward);
        const [{ count: rewardWinnersToday }] = await tx
          .select({ count: sql<number>`count(*)` })
          .from(spinHistory)
          .where(and(eq(spinHistory.rewardId, reward.id), gte(spinHistory.spinDate, todayStart)));

        if ((rewardWinnersToday ?? 0) < reward.maxDailyWinners) {
          eligibleRewards.push({ ...reward, rewardAmount });
        }
      }

      if (!eligibleRewards.length) {
        throw new Error("No spin rewards are currently available.");
      }

      const [{ totalPaidToday }] = await tx
        .select({ totalPaidToday: sql<number>`coalesce(sum(${spinHistory.rewardAmount}), 0)` })
        .from(spinHistory)
        .where(gte(spinHistory.spinDate, todayStart));

      const currentPaidToday = Number(totalPaidToday ?? 0);
      const payoutLimitedRewards = eligibleRewards.filter(
        (reward) => currentPaidToday + reward.rewardAmount <= settings.maxDailyPayout,
      );
      const rewardPool = payoutLimitedRewards.length ? payoutLimitedRewards : eligibleRewards;
      const reward = pickRandomItem(rewardPool);
      const rewardAmount = reward.rewardAmount;
      const nextBalance = toNumber(wallet.balance) - settings.spinCost + rewardAmount;
      const wheelSegment = rewardPool.findIndex((item) => item.id === reward.id);

      await tx
        .update(wallets)
        .set({ balance: String(nextBalance), updatedAt: new Date() })
        .where(eq(wallets.id, wallet.id));

      await tx.insert(spinHistory).values({
        userId,
        rewardId: reward.id,
        rewardAmount: String(rewardAmount),
        spinCost: String(settings.spinCost),
      });

      await tx.insert(walletTransactions).values([
        {
          userId,
          walletId: wallet.id,
          type: "spin_fee",
          amount: String(settings.spinCost),
          status: "completed",
          reference: user.referenceId ?? undefined,
          description: "Daily spin fee",
        },
        {
          userId,
          walletId: wallet.id,
          type: "spin_reward",
          amount: String(rewardAmount),
          status: "completed",
          reference: user.referenceId ?? undefined,
          description: `Spin reward: ${reward.label}`,
        },
      ]);

      return {
        reward: {
          ...reward,
          rewardAmount,
        },
        spinCost: settings.spinCost,
        wheelSegment,
      };
    });
  },

  async updateSettings(input: {
    spinCost: number;
    maxDailyPayout: number;
    maxSingleReward: number;
    dailySpinLimit: number;
  }) {
    const [existing] = await db.select().from(spinSettings).limit(1);

    if (!existing) {
      const [created] = await db.insert(spinSettings).values({
        spinCost: String(input.spinCost),
        maxDailyPayout: String(input.maxDailyPayout),
        maxSingleReward: String(input.maxSingleReward),
        dailySpinLimit: input.dailySpinLimit,
      }).returning();

      return {
        ...created,
        spinCost: toNumber(created.spinCost),
        maxDailyPayout: toNumber(created.maxDailyPayout),
        maxSingleReward: toNumber(created.maxSingleReward),
      };
    }

    const [updated] = await db
      .update(spinSettings)
      .set({
        spinCost: String(input.spinCost),
        maxDailyPayout: String(input.maxDailyPayout),
        maxSingleReward: String(input.maxSingleReward),
        dailySpinLimit: input.dailySpinLimit,
        updatedAt: new Date(),
      })
      .where(eq(spinSettings.id, existing.id))
      .returning();

    return {
      ...updated,
      spinCost: toNumber(updated.spinCost),
      maxDailyPayout: toNumber(updated.maxDailyPayout),
      maxSingleReward: toNumber(updated.maxSingleReward),
    };
  },

  async updateReward(
    rewardId: string,
    input: Partial<{
      label: string;
      rewardType: "cash" | "free_entry" | "none";
      rewardAmount: number;
      maxDailyWinners: number;
      isActive: boolean;
    }>,
  ) {
    const patch = {
      ...(input.label ? { label: input.label } : {}),
      ...(input.rewardType ? { rewardType: input.rewardType } : {}),
      ...(typeof input.rewardAmount === "number" ? { rewardAmount: String(input.rewardAmount) } : {}),
      ...(typeof input.maxDailyWinners === "number" ? { maxDailyWinners: input.maxDailyWinners } : {}),
      ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
    };

    const [reward] = await db.update(spinRewards).set(patch).where(eq(spinRewards.id, rewardId)).returning();
    return {
      ...reward,
      rewardAmount: toNumber(reward.rewardAmount),
    };
  },
};
