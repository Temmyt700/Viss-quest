import { and, desc, eq, gte, inArray, isNull, lte, ne } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { drawEntries, drawPrizeImages, drawPrizes, draws, notifications, users, winners } from "../../db/schema/index.js";
import { pickRandomItem } from "../../utils/random.js";
import { getUtcWeekStart } from "../../utils/time.js";
import { notificationsService } from "../notifications/notifications.service.js";

const getAnnouncementReadyAt = (selectedAt: Date) => new Date(selectedAt.getTime() + env.WINNER_ANNOUNCEMENT_DELAY_MINUTES * 60_000);

const mapWinnerRecords = (
  winnerRows: Array<typeof winners.$inferSelect>,
  drawRows: Array<typeof draws.$inferSelect>,
  prizeRows: Array<typeof drawPrizes.$inferSelect>,
  imageRows: Array<typeof drawPrizeImages.$inferSelect>,
) =>
  winnerRows.map((winner) => {
    const draw = drawRows.find((item) => item.id === winner.drawId);
    const prize = prizeRows.find((item) => item.id === winner.drawPrizeId);
    const image = imageRows
      .filter((item) => item.drawPrizeId === winner.drawPrizeId)
      .sort((left, right) => left.sortOrder - right.sortOrder)[0];

    return {
      ...winner,
      slotNumber: draw?.slotNumber ?? null,
      drawStatus: draw?.status ?? "winner_announced",
      drawTitle: draw?.title ?? prize?.title ?? winner.prizeTitle,
      imageUrl: image?.imageUrl ?? prize?.imageUrl ?? null,
      suspenseMessage: winner.announcedAt ? null : "Winner announcement coming shortly.",
      readyToAnnounceAt: getAnnouncementReadyAt(winner.selectedAt),
    };
  });

export const winnersService = {
  async list() {
    const winnerRows = await db
      .select()
      .from(winners)
      .where(lte(winners.selectedAt, new Date()))
      .orderBy(desc(winners.selectedAt));

    const announced = winnerRows.filter((winner) => winner.announcedAt);
    if (!announced.length) {
      return [];
    }

    const drawIds = [...new Set(announced.map((item) => item.drawId))];
    const prizeIds = [...new Set(announced.map((item) => item.drawPrizeId))];
    const [drawRows, prizeRows, imageRows] = await Promise.all([
      db.select().from(draws).where(inArray(draws.id, drawIds)),
      db.select().from(drawPrizes).where(inArray(drawPrizes.id, prizeIds)),
      db.select().from(drawPrizeImages).where(inArray(drawPrizeImages.drawPrizeId, prizeIds)),
    ]);

    return mapWinnerRecords(announced, drawRows, prizeRows, imageRows);
  },

  async listPending() {
    const pendingRows = await db
      .select()
      .from(winners)
      .where(isNull(winners.announcedAt))
      .orderBy(desc(winners.selectedAt));

    if (!pendingRows.length) {
      return [];
    }

    const drawIds = [...new Set(pendingRows.map((item) => item.drawId))];
    const prizeIds = [...new Set(pendingRows.map((item) => item.drawPrizeId))];
    const [drawRows, prizeRows, imageRows] = await Promise.all([
      db.select().from(draws).where(inArray(draws.id, drawIds)),
      db.select().from(drawPrizes).where(inArray(drawPrizes.id, prizeIds)),
      db.select().from(drawPrizeImages).where(inArray(drawPrizeImages.drawPrizeId, prizeIds)),
    ]);

    return mapWinnerRecords(pendingRows, drawRows, prizeRows, imageRows);
  },

  async listLatestBySlots() {
    const announced = await this.list();
    return [1, 2, 3]
      .map((slotNumber) => announced.find((winner) => winner.slotNumber === slotNumber))
      .filter(Boolean);
  },

  async selectForDraw(drawId: string, { forceReselect = false } = {}) {
    if (!drawId) {
      throw new Error("A draw id is required to select a winner.");
    }

    return db.transaction(async (tx) => {
      const [draw] = await tx.select().from(draws).where(eq(draws.id, drawId)).limit(1);
      if (!draw) {
        throw new Error("Draw not found.");
      }

      const [prize] = await tx.select().from(drawPrizes).where(eq(drawPrizes.drawId, drawId)).limit(1);
      if (!prize) {
        throw new Error("Draw prize not found.");
      }

      const [existingWinner] = await tx.select().from(winners).where(eq(winners.drawPrizeId, prize.id)).limit(1);
      if (existingWinner && !forceReselect) {
        return existingWinner;
      }

      const entries = await tx
        .select()
        .from(drawEntries)
        .where(eq(drawEntries.drawPrizeId, prize.id))
        .orderBy(drawEntries.createdAt);

      if (!entries.length) {
        await tx
          .update(draws)
          .set({ status: "closed", updatedAt: new Date() })
          .where(eq(draws.id, drawId));
        return null;
      }

      const selectedAt = new Date();
      const weekStart = getUtcWeekStart(selectedAt);
      const recentWeeklyWinners = await tx
        .select({ userId: winners.userId })
        .from(winners)
        .where(and(gte(winners.selectedAt, weekStart), ne(winners.drawId, drawId)));
      const weeklyWinnerIds = new Set(recentWeeklyWinners.map((winner) => winner.userId));
      const eligibleEntries = entries.filter((entry) => !weeklyWinnerIds.has(entry.userId));

      // Each entry is one chance, but users who already won this week are
      // excluded first. If every entrant already won this week, we fall back to
      // the full pool so the draw can still complete instead of stalling.
      const selectedEntry = pickRandomItem(eligibleEntries.length ? eligibleEntries : entries);

      if (existingWinner) {
        await tx
          .update(winners)
          .set({
            userId: selectedEntry.userId,
            referenceId: selectedEntry.referenceId,
            entryId: selectedEntry.id,
            prizeTitle: prize.title,
            selectedAt,
            announcedAt: null,
          })
          .where(eq(winners.id, existingWinner.id));
      } else {
        await tx.insert(winners).values({
          drawId,
          drawPrizeId: prize.id,
          userId: selectedEntry.userId,
          referenceId: selectedEntry.referenceId,
          entryId: selectedEntry.id,
          prizeTitle: prize.title,
          selectedAt,
          announcedAt: null,
        });
      }

      await tx
        .update(draws)
        .set({ status: "winner_pending", updatedAt: new Date() })
        .where(eq(draws.id, drawId));

      const [winner] = await tx.select().from(winners).where(eq(winners.drawPrizeId, prize.id)).limit(1);
      return winner ?? null;
    });
  },

  async announceWinner(drawId: string) {
    if (!drawId) {
      throw new Error("A draw id is required to announce a winner.");
    }

    return db.transaction(async (tx) => {
      const [winner] = await tx
        .select()
        .from(winners)
        .where(and(eq(winners.drawId, drawId), isNull(winners.announcedAt)))
        .limit(1);

      if (!winner) {
        throw new Error("Pending winner not found.");
      }

      const announcedAt = new Date();
      await tx
        .update(winners)
        .set({ announcedAt })
        .where(eq(winners.id, winner.id));

      await tx
        .update(draws)
        .set({ status: "winner_announced", updatedAt: announcedAt })
        .where(eq(draws.id, drawId));

      if (await notificationsService.isEventEnabled("prizeWon", tx)) {
        await tx.insert(notifications).values({
          userId: winner.userId,
          title: "You won a draw",
          message: `Congratulations. Your reference ID ${winner.referenceId} won ${winner.prizeTitle}.`,
          type: "winner_announced",
        });
      }

      return { success: true, winnerId: winner.id };
    });
  },

  async announceDuePending(now = new Date()) {
    const pendingRows = await db.select().from(winners).where(isNull(winners.announcedAt));
    const dueWinners = pendingRows.filter((winner) => getAnnouncementReadyAt(winner.selectedAt) <= now);

    // The suspense window is enforced here so draws can close immediately, keep
    // the winner hidden for a short period, then announce automatically.
    for (const winner of dueWinners) {
      await this.announceWinner(winner.drawId);
    }

    return { processed: dueWinners.length };
  },

  async rerunSelection(drawId: string) {
    if (!drawId) {
      throw new Error("A draw id is required to re-run winner selection.");
    }

    return this.selectForDraw(drawId, { forceReselect: true });
  },

  async getWinningUserIds() {
    const announcedRows = await db.select({ userId: winners.userId }).from(winners).where(lte(winners.selectedAt, new Date()));
    return announcedRows.map((row) => row.userId);
  },

  async getLatestWinForUser(userId: string) {
    const [winner] = await db
      .select()
      .from(winners)
      .where(and(eq(winners.userId, userId), lte(winners.selectedAt, new Date())))
      .orderBy(desc(winners.selectedAt))
      .limit(1);

    if (!winner || !winner.announcedAt) {
      return null;
    }

    const [draw, prize, winnerUser] = await Promise.all([
      db.select().from(draws).where(eq(draws.id, winner.drawId)).limit(1),
      db.select().from(drawPrizes).where(eq(drawPrizes.id, winner.drawPrizeId)).limit(1),
      db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1),
    ]);

    return {
      ...winner,
      slotNumber: draw[0]?.slotNumber ?? null,
      prizeTitle: winner.prizeTitle,
      drawTitle: draw[0]?.title ?? prize[0]?.title ?? winner.prizeTitle,
      userName: winnerUser[0]?.name ?? "Winner",
    };
  },
};
