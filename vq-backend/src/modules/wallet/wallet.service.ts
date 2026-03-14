import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { wallets, walletTransactions } from "../../db/schema/index.js";

export const walletService = {
  async getWallet(userId: string) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    return wallet;
  },

  async getTransactions(userId: string, limit = 50) {
    return db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit);
  },
};
