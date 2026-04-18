import { and, count, desc, eq, inArray, isNotNull, lte } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  drawEntries,
  drawPrizes,
  quizAttempts,
  quizzes,
  users,
  walletTransactions,
  wallets,
  winners,
} from "../../db/schema/index.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { referralsService } from "../referrals/referrals.service.js";
import { spinService } from "../spin/spin.service.js";
import { winnersService } from "../winners/winners.service.js";

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
    const now = new Date();

    const [
      userRows,
      walletRows,
      entryRows,
      recentTransactions,
      referralSummary,
      notificationsSnapshot,
      spinStatus,
      activeQuizRows,
      latestWin,
      participationRows,
      winRows,
    ] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1),
      db.select().from(drawEntries).where(eq(drawEntries.userId, userId)).orderBy(desc(drawEntries.createdAt)).limit(10),
      db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt)).limit(10),
      referralsService.getSummary(userId),
      notificationsService.list(userId, { limit: 5, offset: 0 }),
      spinService.getStatus(userId),
      db
        .select()
        .from(quizzes)
        .where(and(eq(quizzes.isActive, true), lte(quizzes.activeFrom, now)))
        .orderBy(desc(quizzes.activeFrom), desc(quizzes.createdAt))
        .limit(1),
      winnersService.getLatestWinForUser(userId),
      db.select({ total: count() }).from(drawEntries).where(eq(drawEntries.userId, userId)),
      db.select({ total: count() }).from(winners).where(and(eq(winners.userId, userId), isNotNull(winners.announcedAt))),
    ]);

    const [user] = userRows;
    const [wallet] = walletRows;
    const prizeIds = entryRows.map((entry) => entry.drawPrizeId);
    const [activeQuiz] = activeQuizRows;
    const [{ total: participations = 0 } = { total: 0 }] = participationRows;
    const [{ total: wins = 0 } = { total: 0 }] = winRows;
    const [activeQuizAttempt] = activeQuiz
      ? await db
          .select()
          .from(quizAttempts)
          .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, activeQuiz.id)))
          .limit(1)
      : [null];
    const prizeRows = prizeIds.length ? await db.select().from(drawPrizes).where(inArray(drawPrizes.id, prizeIds)) : [];
    const prizesById = new Map(prizeRows.map((prize) => [prize.id, prize]));

    return {
      user,
      wallet,
      participations: Number(participations ?? 0),
      wins: Number(wins ?? 0),
      recentEntries: entryRows.slice(0, 10).map((entry) => ({
        ...entry,
        prizeTitle: prizesById.get(entry.drawPrizeId)?.title ?? "Unknown Prize",
      })),
      enteredDrawPrizeIds: [...new Set(entryRows.map((entry) => entry.drawPrizeId))],
      winnerNotice: latestWin
        ? {
            winnerId: latestWin.id,
            prizeTitle: latestWin.prizeTitle,
            referenceId: latestWin.referenceId,
            slotNumber: latestWin.slotNumber,
            announcedAt: latestWin.announcedAt,
            message: "Congratulations! You won this draw!",
          }
        : null,
      recentTransactions,
      referralSummary,
      notifications: {
        unreadCount: Number(notificationsSnapshot.unreadCount ?? 0),
        latest: notificationsSnapshot.items,
      },
      dailySpin: {
        canSpin: Boolean(spinStatus.canSpin),
        hasSpunToday: Boolean(spinStatus.hasSpunToday),
        dailySpinLimit: spinStatus.dailySpinLimit,
        paidSpinsUsed: spinStatus.paidSpinsUsed,
        availableFreeSpins: spinStatus.availableFreeSpins,
        remainingTotalSpins: spinStatus.remainingTotalSpins,
      },
      dailyQuiz: {
        hasActiveQuiz: Boolean(activeQuiz),
        quizId: activeQuiz?.id ?? null,
        attemptedToday: Boolean(activeQuizAttempt),
        rewardAmount: Number(activeQuizAttempt?.rewardAmount ?? 0),
        isCorrect: Boolean(activeQuizAttempt?.isCorrect),
      },
    };
  },

  async getNotifications(userId: string) {
    return notificationsService.list(userId, { limit: 20, offset: 0 });
  },
};
