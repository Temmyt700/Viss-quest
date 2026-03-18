import { and, desc, eq, gte, inArray, isNull, lte, ne } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { drawEntries, drawPrizeImages, drawPrizes, draws, notifications, users, winners } from "../../db/schema/index.js";
import { pickRandomItems } from "../../utils/random.js";
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

const hydrateWinnerRows = async (winnerRows: Array<typeof winners.$inferSelect>) => {
  if (!winnerRows.length) {
    return [];
  }

  const drawIds = [...new Set(winnerRows.map((item) => item.drawId))];
  const prizeIds = [...new Set(winnerRows.map((item) => item.drawPrizeId))];
  const [drawRows, prizeRows, imageRows] = await Promise.all([
    db.select().from(draws).where(inArray(draws.id, drawIds)),
    db.select().from(drawPrizes).where(inArray(drawPrizes.id, prizeIds)),
    db.select().from(drawPrizeImages).where(inArray(drawPrizeImages.drawPrizeId, prizeIds)),
  ]);

  return mapWinnerRecords(winnerRows, drawRows, prizeRows, imageRows);
};

export const winnersService = {
  async list() {
    const winnerRows = await db
      .select()
      .from(winners)
      .where(lte(winners.selectedAt, new Date()))
      .orderBy(desc(winners.selectedAt));

    const announced = winnerRows.filter((winner) => winner.announcedAt);
    return hydrateWinnerRows(announced);
  },

  async listPending() {
    const pendingRows = await db
      .select()
      .from(winners)
      .where(isNull(winners.announcedAt))
      .orderBy(desc(winners.selectedAt));

    return hydrateWinnerRows(pendingRows);
  },

  async listByDrawIds(drawIds: string[], { includePending = false } = {}) {
    if (!drawIds.length) {
      return [];
    }

    const winnerRows = await db
      .select()
      .from(winners)
      .where(inArray(winners.drawId, drawIds))
      .orderBy(desc(winners.selectedAt));

    const filteredRows = includePending ? winnerRows : winnerRows.filter((winner) => winner.announcedAt);
    return hydrateWinnerRows(filteredRows);
  },

  async listLatestBySlots() {
    const announced = await this.list();
    const latestDrawIdsBySlot = new Map<number, string>();

    // Each slot can now surface many winners. "Latest winners" means all
    // winners tied to the most recently announced draw currently visible for
    // that slot, not just the first winner row in that slot.
    for (const winner of announced) {
      if (!winner.slotNumber || latestDrawIdsBySlot.has(winner.slotNumber)) continue;
      latestDrawIdsBySlot.set(winner.slotNumber, winner.drawId);
    }

    return announced.filter((winner) => winner.slotNumber && latestDrawIdsBySlot.get(winner.slotNumber) === winner.drawId);
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

      const existingWinners = await tx
        .select()
        .from(winners)
        .where(eq(winners.drawPrizeId, prize.id))
        .orderBy(desc(winners.selectedAt));
      const winnerCount = Math.max(1, prize.winnerCount ?? 1);
      if (existingWinners.length >= winnerCount && !forceReselect) {
        return existingWinners;
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
        return [];
      }

      const selectedAt = new Date();
      const weekStart = getUtcWeekStart(selectedAt);
      const recentWeeklyWinners = await tx
        .select({ userId: winners.userId })
        .from(winners)
        .where(and(gte(winners.selectedAt, weekStart), ne(winners.drawId, drawId)));
      const weeklyWinnerIds = new Set(recentWeeklyWinners.map((winner) => winner.userId));
      const eligibleEntries = entries.filter((entry) => !weeklyWinnerIds.has(entry.userId));

      // Multi-winner draws are selected without replacement. Weekly winners are
      // preferred out of the pool first, then any remaining winner slots fall
      // back to the broader entry pool so the draw can still complete cleanly.
      const targetWinnerCount = Math.min(winnerCount, entries.length);
      const selectedEntries = pickRandomItems(eligibleEntries, targetWinnerCount);
      if (selectedEntries.length < targetWinnerCount) {
        const alreadySelected = new Set(selectedEntries.map((entry) => entry.id));
        const fallbackEntries = entries.filter((entry) => !alreadySelected.has(entry.id));
        selectedEntries.push(...pickRandomItems(fallbackEntries, targetWinnerCount - selectedEntries.length));
      }

      if (existingWinners.length) {
        await tx.delete(winners).where(eq(winners.drawPrizeId, prize.id));
      }

      if (selectedEntries.length) {
        await tx.insert(winners).values(
          selectedEntries.map((entry) => ({
            drawId,
            drawPrizeId: prize.id,
            userId: entry.userId,
            referenceId: entry.referenceId,
            entryId: entry.id,
            prizeTitle: prize.title,
            selectedAt,
            announcedAt: null,
          })),
        );
      }

      await tx
        .update(draws)
        .set({ status: "winner_pending", updatedAt: new Date() })
        .where(eq(draws.id, drawId));

      return tx.select().from(winners).where(eq(winners.drawPrizeId, prize.id)).orderBy(desc(winners.selectedAt));
    });
  },

  async announceWinner(drawId: string) {
    if (!drawId) {
      throw new Error("A draw id is required to announce a winner.");
    }

    return db.transaction(async (tx) => {
      const pendingWinners = await tx
        .select()
        .from(winners)
        .where(and(eq(winners.drawId, drawId), isNull(winners.announcedAt)));

      if (!pendingWinners.length) {
        throw new Error("Pending winner not found.");
      }

      const announcedAt = new Date();
      await tx
        .update(winners)
        .set({ announcedAt })
        .where(and(eq(winners.drawId, drawId), isNull(winners.announcedAt)));

      await tx
        .update(draws)
        .set({ status: "winner_announced", updatedAt: announcedAt })
        .where(eq(draws.id, drawId));

      if (await notificationsService.isEventEnabled("prizeWon", tx)) {
        await tx.insert(notifications).values(
          pendingWinners.map((winner) => ({
            userId: winner.userId,
            title: "You won a draw",
            message: `Congratulations. Your reference ID ${winner.referenceId} won ${winner.prizeTitle}.`,
            type: "winner_announced",
          })),
        );
      }

      return { success: true, winnerIds: pendingWinners.map((winner) => winner.id) };
    });
  },

  async announceDuePending(now = new Date()) {
    const pendingRows = await db.select().from(winners).where(isNull(winners.announcedAt));
    const dueDrawIds = [...new Set(
      pendingRows
        .filter((winner) => getAnnouncementReadyAt(winner.selectedAt) <= now)
        .map((winner) => winner.drawId),
    )];

    // The suspense window is enforced here so draws can close immediately, keep
    // the winner hidden for a short period, then announce automatically.
    for (const drawId of dueDrawIds) {
      await this.announceWinner(drawId);
    }

    return { processed: dueDrawIds.length };
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
