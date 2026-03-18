import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { drawPrizes, fundingRequests, notifications, quizzes, users } from "../../db/schema/index.js";
import { adminService } from "../admin/admin.service.js";
import { drawsService } from "../draws/draws.service.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { quizService } from "../quiz/quiz.service.js";
import { spinService } from "../spin/spin.service.js";
import { usersService } from "../users/users.service.js";
import { winnersService } from "../winners/winners.service.js";

const TERMINAL_DRAW_STATES = ["closed", "winner_pending", "winner_announced", "completed"] as const;

const mapDrawCard = (draw: any, prize: any, now: Date, drawWinners: any[] = []) => {
  const effectiveStatus = TERMINAL_DRAW_STATES.includes(draw.status) ? draw.status : (prize.urgencyStatus ?? draw.status);

  return {
  id: prize.id,
  drawId: draw.id,
  slotNumber: draw.slotNumber,
  title: prize.title,
  description: prize.description ?? draw.description ?? "",
  coverImage: prize.images?.[0]?.imageUrl ?? prize.imageUrl ?? null,
  images: (prize.images || []).map((image: any) => image.imageUrl ?? image),
  entryFee: Number(prize.entryFee ?? 0),
  entryFeeText: `NGN ${Number(prize.entryFee ?? 0).toLocaleString()}`,
  prizeValue: Number(prize.prizeValue ?? 0),
  winnerCountSetting: Number(prize.winnerCount ?? 1),
  status: effectiveStatus,
  statusLabel: String(effectiveStatus ?? "available").replaceAll("_", " "),
  canEnter: !["filled", "closed", "winner_pending", "winner_announced", "completed"].includes(effectiveStatus),
  startTime: prize.startTime ?? draw.startTime,
  endTime: prize.endTime ?? draw.endTime,
  countdownTarget: prize.endTime ?? draw.endTime ?? null,
  currentEntries: prize.currentEntries,
  maxEntries: prize.maxEntries,
  drawPrizeId: prize.id,
  drawRef: draw.drawId,
  goLiveMode: draw.goLiveMode,
  drawDay: draw.drawDay,
  serverNow: now.toISOString(),
  winners: drawWinners,
  winnerCount: drawWinners.length,
  winnerReferenceIds: drawWinners.map((winner: any) => winner.referenceId),
  winnerReferenceId: drawWinners[0]?.referenceId ?? null,
  };
};

const toDashboardView = (dashboard: any) => {
  const latestNotifications = (dashboard.latestNotifications || []).slice(0, 3).map((item: any) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    isRead: item.isRead,
    createdAt: item.createdAt,
  }));

  return {
    critical: {
      user: {
        id: dashboard.user?.id,
        fullName: dashboard.user?.name ?? "Guest User",
        referenceId: dashboard.user?.referenceId ?? "PENDING_REF",
        role: dashboard.user?.role ?? "user",
      },
      summary: {
        participations: dashboard.participations ?? 0,
        wins: dashboard.wins ?? 0,
      },
      wallet: {
        balance: Number(dashboard.wallet?.balance ?? 0),
      },
      notifications: {
        unreadCount: Number(dashboard.notifications?.unreadCount ?? 0),
        latest: latestNotifications,
      },
      referrals: {
        total: dashboard.referralSummary?.totalReferrals ?? 0,
        successful: dashboard.referralSummary?.successfulReferrals ?? 0,
        earned: Number(dashboard.referralSummary?.totalRewardsEarned ?? 0),
        code: dashboard.referralSummary?.referralCode ?? dashboard.user?.referenceId ?? "PENDING_REF",
      },
      spinStatus: dashboard.dailySpin,
      quizStatus: dashboard.dailyQuiz,
      winnerNotice: dashboard.winnerNotice,
      enteredDrawPrizeIds: dashboard.enteredDrawPrizeIds ?? [],
    },
    secondary: {
      recentTransactions: dashboard.recentTransactions ?? [],
      recentEntries: dashboard.recentEntries ?? [],
      referralActivity: dashboard.referralSummary?.recentActivity ?? [],
    },
  };
};

export const appService = {
  async getHome() {
    const now = new Date();
    const [activeDraws, recentWinners, announcementRows] = await Promise.all([
      drawsService.listActive(now),
      winnersService.listLatestBySlots(),
      db
        .select({
          id: notifications.id,
          title: notifications.title,
          message: notifications.message,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(and(isNull(notifications.userId), eq(notifications.type, "announcement")))
        .orderBy(desc(notifications.createdAt))
        .limit(3),
    ]);
    const activeDrawWinners = await winnersService.listByDrawIds(activeDraws.map((draw) => draw.id));
    const drawWinnersByDrawId = new Map<string, any[]>();

    for (const winner of activeDrawWinners) {
      const slotWinners = drawWinnersByDrawId.get(winner.drawId) ?? [];
      slotWinners.push(winner);
      drawWinnersByDrawId.set(winner.drawId, slotWinners);
    }

    return {
      critical: {
        heroDraws: activeDraws
          .flatMap((draw) =>
            (draw.prizes || []).map((prize: any) => mapDrawCard(draw, prize, now, drawWinnersByDrawId.get(draw.id) ?? [])),
          )
          .filter((draw) => Boolean(draw.coverImage)),
        announcements: announcementRows,
        latestWinners: recentWinners,
      },
      secondary: {
        winnersPreview: recentWinners,
      },
      serverNow: now.toISOString(),
    };
  },

  async getDashboard(userId: string) {
    const [dashboard, latestNotifications] = await Promise.all([
      usersService.getDashboard(userId),
      notificationsService.list(userId, { limit: 5, offset: 0 }),
    ]);

    return toDashboardView({
      ...dashboard,
      latestNotifications: latestNotifications.items,
    });
  },

  async getDailyChances(userId: string) {
    const [spinStatus, activeQuiz, dashboard] = await Promise.all([
      spinService.getStatus(userId),
      quizService.getToday(),
      usersService.getDashboard(userId),
    ]);

    return {
      critical: {
        walletBalance: Number(dashboard.wallet?.balance ?? 0),
        spin: {
          spinCost: Number(spinStatus.spinCost ?? 0),
          canSpin: Boolean(spinStatus.canSpin),
          hasSpunToday: Boolean(spinStatus.hasSpunToday),
          dailySpinLimit: Number(spinStatus.dailySpinLimit ?? 1),
          paidSpinsUsed: Number(spinStatus.paidSpinsUsed ?? 0),
          availableFreeSpins: Number(spinStatus.availableFreeSpins ?? 0),
          remainingTotalSpins: Number(spinStatus.remainingTotalSpins ?? 0),
          rewards: (spinStatus.rewards || [])
            .filter((reward: any) => reward.isActive)
            .map((reward: any, index: number) => ({
            id: reward.id,
            label: reward.label,
            rewardType: reward.rewardType,
            rewardAmount: Number(reward.rewardAmount ?? 0),
            wheelSegment: index,
            })),
        },
        quiz: activeQuiz
          ? {
              id: activeQuiz.id,
              question: activeQuiz.question,
              optionA: activeQuiz.optionA,
              optionB: activeQuiz.optionB,
              optionC: activeQuiz.optionC,
              optionD: activeQuiz.optionD,
              answered: Boolean(dashboard.dailyQuiz?.attemptedToday),
              isCorrect: Boolean(dashboard.dailyQuiz?.isCorrect),
              rewardAmount: Number(dashboard.dailyQuiz?.rewardAmount ?? 0),
            }
          : null,
      },
    };
  },

  async getAdminOverview() {
    const now = new Date();
    const [overview, deposits, managedDraws, referrals, latestNotifications, participants] = await Promise.all([
      adminService.getOverview(),
      db
        .select({
          id: fundingRequests.id,
          referenceId: fundingRequests.referenceId,
          amount: fundingRequests.amount,
          status: fundingRequests.status,
          createdAt: fundingRequests.createdAt,
        })
        .from(fundingRequests)
        .orderBy(desc(fundingRequests.createdAt))
        .limit(5),
      drawsService.listManaged(now),
      adminService.getReferralInsights(),
      db
        .select({
          id: notifications.id,
          title: notifications.title,
          message: notifications.message,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(eq(notifications.type, "announcement"))
        .orderBy(desc(notifications.createdAt))
        .limit(5),
      adminService.listParticipants(),
    ]);

    return {
      critical: {
        totals: {
          totalUsers: overview.totalUsers,
          pendingWalletDeposits: overview.pendingDeposits,
          activeDraws: managedDraws.filter(
            (draw) => (draw.prizes || []).some((prize: any) => !["closed", "filled", "completed"].includes(prize.urgencyStatus)),
          ).length,
        },
        latestDeposits: deposits,
        drawSlots: [1, 2, 3].map((slotNumber) => {
          const slotDraw = managedDraws.find((draw) => draw.slotNumber === slotNumber && !["closed", "deleted"].includes(draw.status));
          return {
            slotNumber,
            occupied: Boolean(slotDraw),
            title: slotDraw?.title ?? null,
            status: slotDraw?.status ?? "available",
          };
        }),
        referralStats: {
          totalReferredUsers: referrals.totalReferredUsers,
          latestRelationships: referrals.latestRelationships.slice(0, 5),
        },
      },
      secondary: {
        latestNotifications,
        participants: participants.slice(0, 10),
        managedDraws,
      },
    };
  },
};
