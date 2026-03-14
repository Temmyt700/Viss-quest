import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { adminLogs, drawPrizes, draws, fundingRequests, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { toNumber } from "../../utils/money.js";

export const adminService = {
  async getOverview() {
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(users);
    const [{ pendingDeposits }] = await db
      .select({ pendingDeposits: count() })
      .from(fundingRequests)
      .where(eq(fundingRequests.status, "pending"));
    const [{ activeDraws }] = await db.select({ activeDraws: count() }).from(draws);

    return {
      totalUsers,
      pendingDeposits,
      activeDraws,
    };
  },

  async listUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  },

  async getUser(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    const transactions = await db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt));
    return { user, wallet, transactions };
  },

  async updateUserStatus(id: string, status: "active" | "suspended" | "banned", actorUserId: string) {
    await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id));
    await db.insert(adminLogs).values({
      actorUserId,
      action: "user.status.updated",
      targetType: "user",
      targetId: id,
      metadata: { status },
    });
    return { success: true };
  },

  async updateUserRole(id: string, role: "user" | "moderator" | "admin", actorUserId: string) {
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
    await db.insert(adminLogs).values({
      actorUserId,
      action: "user.role.updated",
      targetType: "user",
      targetId: id,
      metadata: { role },
    });
    return { success: true };
  },

  async adjustWallet(input: { userId: string; amount: number; reason: string }, actorUserId: string) {
    return db.transaction(async (tx) => {
      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, input.userId)).limit(1);
      if (!wallet) {
        throw new Error("Wallet not found.");
      }

      const nextBalance = toNumber(wallet.balance) + input.amount;
      await tx.update(wallets).set({ balance: String(nextBalance), updatedAt: new Date() }).where(eq(wallets.id, wallet.id));
      await tx.insert(walletTransactions).values({
        userId: input.userId,
        walletId: wallet.id,
        type: "admin_adjustment",
        amount: String(input.amount),
        status: "completed",
        description: input.reason,
      });
      await tx.insert(adminLogs).values({
        actorUserId,
        action: "wallet.adjusted",
        targetType: "wallet",
        targetId: wallet.id,
        metadata: input,
      });
      return { success: true };
    });
  },

  async getWalletStats() {
    const [{ totalWalletBalance }] = await db
      .select({ totalWalletBalance: sql<number>`coalesce(sum(${wallets.balance}), 0)` })
      .from(wallets);

    return {
      totalWalletBalance: Number(totalWalletBalance ?? 0),
    };
  },
};
