import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "../../db/client.js";
import { spinHistory, spinRewards, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { pickRandomItem } from "../../utils/random.js";
import { isSameUtcDay } from "../../utils/time.js";
import { toNumber } from "../../utils/money.js";

const SPIN_COST = 15;

export const spinService = {
  async getStatus(userId: string) {
    const [latest] = await db.select().from(spinHistory).where(eq(spinHistory.userId, userId)).orderBy(desc(spinHistory.spinDate)).limit(1);
    return {
      hasSpunToday: latest ? isSameUtcDay(new Date(latest.spinDate), new Date()) : false,
      spinCost: SPIN_COST,
    };
  },

  async spin(userId: string) {
    return db.transaction(async (tx) => {
      const status = await this.getStatus(userId);
      if (status.hasSpunToday) {
        throw new Error("You have already spun today.");
      }

      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!wallet || !user) {
        throw new Error("User wallet not found.");
      }

      if (toNumber(wallet.balance) < SPIN_COST) {
        throw new Error("Insufficient wallet balance.");
      }

      const rewards = await tx.select().from(spinRewards).where(eq(spinRewards.isActive, true));
      const reward = pickRandomItem(rewards);
      const rewardAmount = toNumber(reward.rewardAmount);
      const nextBalance = toNumber(wallet.balance) - SPIN_COST + rewardAmount;

      await tx.update(wallets).set({ balance: String(nextBalance), updatedAt: new Date() }).where(eq(wallets.id, wallet.id));
      await tx.insert(spinHistory).values({
        userId,
        rewardId: reward.id,
        rewardAmount: String(rewardAmount),
        spinCost: String(SPIN_COST),
      });
      await tx.insert(walletTransactions).values([
        {
          userId,
          walletId: wallet.id,
          type: "spin_fee",
          amount: String(SPIN_COST),
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
        reward,
        spinCost: SPIN_COST,
      };
    });
  },
};
