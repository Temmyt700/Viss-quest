import { and, desc, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  drawEntries,
  drawPrizes,
  notifications,
  quizAttempts,
  quizzes,
  spinHistory,
  users,
  walletTransactions,
  wallets,
  winners,
} from "../../db/schema/index.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { referralsService } from "../referrals/referrals.service.js";
import { getUtcDayStart, isSameUtcDay } from "../../utils/time.js";

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
      latestSpinRows,
      activeQuizRows,
    ] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1),
      db.select().from(drawEntries).where(eq(drawEntries.userId, userId)).orderBy(desc(drawEntries.createdAt)).limit(10),
      db.select().from(winners).where(eq(winners.userId, userId)).orderBy(desc(winners.announcedAt)),
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
      db.select().from(spinHistory).where(eq(spinHistory.userId, userId)).orderBy(desc(spinHistory.spinDate)).limit(1),
      db
        .select()
        .from(quizzes)
        .where(and(eq(quizzes.isActive, true), lte(quizzes.activeFrom, now)))
        .orderBy(desc(quizzes.activeFrom), desc(quizzes.createdAt))
        .limit(1),
    ]);

    const [user] = userRows;
    const [wallet] = walletRows;
    const prizeIds = entryRows.map((entry) => entry.drawPrizeId);
    const [activeQuiz] = activeQuizRows;
    const [latestSpin] = latestSpinRows;
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
      winnerNotice: winRows.length > 0
        ? "You have won a prize. Please submit your testimonial and proof once you receive your prize."
        : null,
      recentTransactions,
      referralSummary,
      notifications: {
        unreadCount: Number(unreadCount ?? 0),
      },
      dailySpin: {
        canSpin: latestSpin ? !isSameUtcDay(new Date(latestSpin.spinDate), now) : true,
        hasSpunToday: latestSpin ? isSameUtcDay(new Date(latestSpin.spinDate), now) : false,
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
