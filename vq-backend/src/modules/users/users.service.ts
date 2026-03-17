import { and, desc, eq, gte, inArray, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  drawEntries,
  drawPrizes,
  notifications,
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
import { getUtcDayStart } from "../../utils/time.js";

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
    const todayStart = getUtcDayStart(now);

    const [
      userRows,
      walletRows,
      entryRows,
      winRows,
      recentTransactions,
      referralSummary,
      unreadNotificationRows,
      spinStatus,
      activeQuizRows,
      latestWin,
    ] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1),
      db.select().from(drawEntries).where(eq(drawEntries.userId, userId)).orderBy(desc(drawEntries.createdAt)).limit(10),
      db.select().from(winners).where(and(eq(winners.userId, userId), isNotNull(winners.announcedAt))).orderBy(desc(winners.announcedAt)),
      db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt)).limit(10),
      referralsService.getSummary(userId),
      db
        .select({ unreadCount: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            or(eq(notifications.userId, userId), isNull(notifications.userId)),
            eq(notifications.isRead, false),
          ),
        ),
      spinService.getStatus(userId),
      db
        .select()
        .from(quizzes)
        .where(and(eq(quizzes.isActive, true), lte(quizzes.activeFrom, now)))
        .orderBy(desc(quizzes.activeFrom), desc(quizzes.createdAt))
        .limit(1),
      winnersService.getLatestWinForUser(userId),
    ]);

    const [user] = userRows;
    const [wallet] = walletRows;
    const prizeIds = entryRows.map((entry) => entry.drawPrizeId);
    const [activeQuiz] = activeQuizRows;
    const [{ unreadCount = 0 } = { unreadCount: 0 }] = unreadNotificationRows;
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
      participations: entryRows.length,
      wins: winRows.length,
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
        unreadCount: Number(unreadCount ?? 0),
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
    return notificationsService.list(userId);
  },
};
