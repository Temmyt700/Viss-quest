import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { drawEntries, notifications, users, walletTransactions, wallets, winners } from "../../db/schema/index.js";

export const usersService = {
  async getMe(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user;
  },

  async updateMe(userId: string, updates: { name?: string; phone?: string }) {
    await db.update(users).set(updates).where(eq(users.id, userId));
    return this.getMe(userId);
  },

  async getDashboard(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    const entries = await db.select().from(drawEntries).where(eq(drawEntries.userId, userId));
    const winRows = await db.select().from(winners).where(eq(winners.userId, userId));
    const recentTransactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(10);

    return {
      user,
      wallet,
      participations: entries.length,
      wins: winRows.length,
      recentTransactions,
    };
  },

  async getNotifications(userId: string) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  },
};
