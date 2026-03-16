import { count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  adminLogs,
  drawEntries,
  drawPrizes,
  fundingRequests,
  referrals,
  quizzes,
  users,
  walletTransactions,
  wallets,
  winners,
} from "../../db/schema/index.js";
import { toNumber } from "../../utils/money.js";

export const adminService = {
  async getOverview() {
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(users);
    const [{ pendingDeposits }] = await db
      .select({ pendingDeposits: count() })
      .from(fundingRequests)
      .where(eq(fundingRequests.status, "pending"));
    const [{ activeDraws }] = await db.select({ activeDraws: count() }).from(drawPrizes);
    const [{ scheduledQuizzes }] = await db.select({ scheduledQuizzes: count() }).from(quizzes);

    return {
      totalUsers,
      pendingDeposits,
      activeDraws,
      scheduledQuizzes,
    };
  },

  async listUsers() {
    const rows = await db
      .select({
        user: users,
        walletBalance: wallets.balance,
      })
      .from(users)
      .leftJoin(wallets, eq(wallets.userId, users.id))
      .orderBy(desc(users.createdAt));

    return rows.map((row) => ({
      ...row.user,
      walletBalance: toNumber(row.walletBalance ?? "0"),
    }));
  },

  async getUser(userId: string) {
    const [userRows, walletRows, transactions, participations, winRows] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1),
      db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt)),
      db.select().from(drawEntries).where(eq(drawEntries.userId, userId)).orderBy(desc(drawEntries.createdAt)),
      db.select().from(winners).where(eq(winners.userId, userId)).orderBy(desc(winners.announcedAt)),
    ]);

    const [user] = userRows;
    const [wallet] = walletRows;

    return { user, wallet, transactions, participations, wins: winRows };
  },

  async listParticipants() {
    const entries = await db.select().from(drawEntries).orderBy(desc(drawEntries.createdAt));
    const prizeIds = entries.map((entry) => entry.drawPrizeId);
    const prizes = prizeIds.length
      ? await db.select().from(drawPrizes).where(inArray(drawPrizes.id, prizeIds))
      : [];

    return entries.map((entry) => ({
      id: entry.id,
      referenceId: entry.referenceId,
      drawPrizeId: entry.drawPrizeId,
      draw: prizes.find((prize) => prize.id === entry.drawPrizeId)?.title ?? "Unknown Prize",
      status: "Entered",
      createdAt: entry.createdAt,
    }));
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

    const [updatedUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return { success: true, user: updatedUser };
  },

  async updateUserRole(id: string, role: "user" | "admin", actorUserId: string) {
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
    await db.insert(adminLogs).values({
      actorUserId,
      action: "user.role.updated",
      targetType: "user",
      targetId: id,
      metadata: { role },
    });

    const [updatedUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return { success: true, user: updatedUser };
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
    const [{ totalDeposits }] = await db
      .select({ totalDeposits: sql<number>`coalesce(sum(case when ${walletTransactions.type} = 'deposit' then ${walletTransactions.amount}::numeric else 0 end), 0)` })
      .from(walletTransactions);
    const [{ totalSpentOnEntries }] = await db
      .select({ totalSpentOnEntries: sql<number>`coalesce(sum(case when ${walletTransactions.type} = 'entry_fee' then ${walletTransactions.amount}::numeric else 0 end), 0)` })
      .from(walletTransactions);
    const [{ totalSpentOnSpins }] = await db
      .select({ totalSpentOnSpins: sql<number>`coalesce(sum(case when ${walletTransactions.type} = 'spin_fee' then ${walletTransactions.amount}::numeric else 0 end), 0)` })
      .from(walletTransactions);
    const [{ totalRewardsPaid }] = await db
      .select({ totalRewardsPaid: sql<number>`coalesce(sum(case when ${walletTransactions.type} in ('spin_reward', 'quiz_reward') then ${walletTransactions.amount}::numeric else 0 end), 0)` })
      .from(walletTransactions);
    const transactions = await db.select().from(walletTransactions).orderBy(desc(walletTransactions.createdAt)).limit(100);

    return {
      totalWalletBalance: Number(totalWalletBalance ?? 0),
      totalDeposits: Number(totalDeposits ?? 0),
      totalSpentOnEntries: Number(totalSpentOnEntries ?? 0),
      totalSpentOnSpins: Number(totalSpentOnSpins ?? 0),
      totalRewardsPaid: Number(totalRewardsPaid ?? 0),
      transactions,
    };
  },

  async getReferralInsights() {
    const referralRows = await db.select().from(referrals).orderBy(desc(referrals.createdAt));
    const userIds = [...new Set(referralRows.flatMap((row) => [row.referrerUserId, row.refereeUserId]))];
    const relatedUsers = userIds.length ? await db.select().from(users).where(inArray(users.id, userIds)) : [];
    const usersById = new Map(relatedUsers.map((user) => [user.id, user]));

    const totalsByReferrer = new Map<string, number>();
    referralRows.forEach((row) => {
      totalsByReferrer.set(row.referrerUserId, (totalsByReferrer.get(row.referrerUserId) ?? 0) + 1);
    });

    return {
      totalReferredUsers: referralRows.length,
      latestRelationships: referralRows.slice(0, 20).map((row) => ({
        id: row.id,
        referrerUserId: row.referrerUserId,
        referrerName: usersById.get(row.referrerUserId)?.name ?? "Unknown User",
        referrerReferenceId: usersById.get(row.referrerUserId)?.referenceId ?? "PENDING_REF",
        refereeUserId: row.refereeUserId,
        refereeName: usersById.get(row.refereeUserId)?.name ?? "Unknown User",
        refereeReferenceId: usersById.get(row.refereeUserId)?.referenceId ?? "PENDING_REF",
        status: row.status,
        rewardAmount: Number(row.rewardAmount ?? 0),
        createdAt: row.createdAt,
        rewardedAt: row.rewardedAt,
        totalReferralsByReferrer: totalsByReferrer.get(row.referrerUserId) ?? 0,
      })),
    };
  },
};
