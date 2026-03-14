import { and, desc, eq, lte } from "drizzle-orm";
import { db } from "../../db/client.js";
import { drawEntries, drawPrizes, draws, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { getAutomatedStatus } from "../../utils/drawLogic.js";
import { pickRandomItem } from "../../utils/random.js";
import { toNumber } from "../../utils/money.js";

type CreateDrawInput = {
  drawDay: string;
  goLiveMode: "instant" | "schedule";
  startTime?: string;
  endTime?: string;
  prizes: Array<{
    title: string;
    description?: string;
    entryFee: number;
    prizeValue: number;
    imageUrl?: string;
    maxEntries: number;
  }>;
};

export const drawsService = {
  async listActive(now = new Date()) {
    const drawRows = await db.select().from(draws).orderBy(desc(draws.createdAt));
    const prizeRows = await db.select().from(drawPrizes).orderBy(desc(drawPrizes.createdAt));

    return drawRows.map((draw) => ({
      ...draw,
      prizes: prizeRows.filter((prize) => prize.drawId === draw.id).map((prize) => ({
        ...prize,
        urgencyStatus: prize.manualStatusOverride || getAutomatedStatus(
          prize.currentEntries,
          prize.maxEntries,
          prize.endTime ?? draw.endTime ?? now,
          now,
        ),
      })),
    }));
  },

  async getById(drawId: string) {
    const [draw] = await db.select().from(draws).where(eq(draws.id, drawId)).limit(1);
    if (!draw) {
      throw new Error("Draw not found.");
    }

    const prizes = await db.select().from(drawPrizes).where(eq(drawPrizes.drawId, drawId));
    return { ...draw, prizes };
  },

  async create(input: CreateDrawInput) {
    return db.transaction(async (tx) => {
      const [draw] = await tx
        .insert(draws)
        .values({
          drawId: `VQD-${Date.now()}`,
          title: `${input.drawDay} Draw`,
          description: `${input.drawDay} scheduled draw`,
          drawDay: input.drawDay,
          goLiveMode: input.goLiveMode,
          startTime: input.startTime ? new Date(input.startTime) : new Date(),
          endTime: input.endTime ? new Date(input.endTime) : null,
          status: input.goLiveMode === "instant" ? "available" : "draft",
        })
        .returning();

      await tx.insert(drawPrizes).values(
        input.prizes.map((prize) => ({
          drawId: draw.id,
          title: prize.title,
          description: prize.description,
          entryFee: String(prize.entryFee),
          prizeValue: String(prize.prizeValue),
          imageUrl: prize.imageUrl,
          maxEntries: prize.maxEntries,
          currentEntries: 0,
          urgencyStatus: "available",
          startTime: draw.startTime,
          endTime: draw.endTime,
        })),
      );

      return draw;
    });
  },

  async enter(drawId: string, drawPrizeId: string, userId: string) {
    return db.transaction(async (tx) => {
      const [prize] = await tx
        .select()
        .from(drawPrizes)
        .where(and(eq(drawPrizes.id, drawPrizeId), eq(drawPrizes.drawId, drawId)))
        .limit(1);

      if (!prize) {
        throw new Error("Draw prize not found.");
      }

      const currentStatus = prize.manualStatusOverride || getAutomatedStatus(
        prize.currentEntries,
        prize.maxEntries,
        prize.endTime ?? new Date(),
        new Date(),
      );

      if (["filled", "closed", "completed"].includes(currentStatus)) {
        throw new Error("This draw is no longer accepting entries.");
      }

      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!wallet || !user) {
        throw new Error("User wallet not found.");
      }

      const balance = toNumber(wallet.balance);
      const fee = toNumber(prize.entryFee);
      if (balance < fee) {
        throw new Error("Insufficient wallet balance.");
      }

      await tx.insert(drawEntries).values({
        drawId,
        drawPrizeId,
        userId,
        referenceId: user.referenceId ?? "UNKNOWN",
        entryFee: prize.entryFee,
      });

      const nextEntries = prize.currentEntries + 1;
      const nextBalance = balance - fee;
      const nextStatus = prize.manualStatusOverride || getAutomatedStatus(
        nextEntries,
        prize.maxEntries,
        prize.endTime ?? new Date(),
        new Date(),
      );

      await tx
        .update(drawPrizes)
        .set({ currentEntries: nextEntries, urgencyStatus: nextStatus })
        .where(eq(drawPrizes.id, prize.id));

      await tx.update(wallets).set({ balance: String(nextBalance), updatedAt: new Date() }).where(eq(wallets.id, wallet.id));

      await tx.insert(walletTransactions).values({
        userId,
        walletId: wallet.id,
        type: "entry_fee",
        amount: String(fee),
        status: "completed",
        reference: user.referenceId ?? undefined,
        description: `Entered draw prize ${prize.title}`,
      });

      return { success: true };
    });
  },

  async updateStatus(drawPrizeId: string, status: string) {
    await db
      .update(drawPrizes)
      .set({
        manualStatusOverride: status === "auto" ? null : status,
        urgencyStatus: status === "auto" ? "available" : status,
      })
      .where(eq(drawPrizes.id, drawPrizeId));

    return { success: true };
  },

  async closeNow(drawPrizeId: string) {
    await db
      .update(drawPrizes)
      .set({ manualStatusOverride: "filled", urgencyStatus: "filled" })
      .where(eq(drawPrizes.id, drawPrizeId));

    return { success: true };
  },

  async selectWinner(drawPrizeId: string) {
    const entries = await db.select().from(drawEntries).where(eq(drawEntries.drawPrizeId, drawPrizeId));
    return pickRandomItem(entries);
  },

  async closeExpired(now = new Date()) {
    const expiredPrizes = await db
      .select()
      .from(drawPrizes)
      .where(lte(drawPrizes.endTime, now));

    for (const prize of expiredPrizes) {
      await db
        .update(drawPrizes)
        .set({ urgencyStatus: "closed" })
        .where(eq(drawPrizes.id, prize.id));
    }
  },
};
