import { and, desc, eq, inArray, lte, ne, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { drawEntries, drawPrizeImages, drawPrizes, draws, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { getAutomatedStatus } from "../../utils/drawLogic.js";
import { toNumber } from "../../utils/money.js";
import { destroyCloudinaryAsset, uploadBufferToCloudinary } from "../../utils/upload.js";

type DrawPrizeInput = {
  title: string;
  description?: string;
  entryFee: number;
  prizeValue: number;
  imageUrl?: string;
  imageUrls?: string[];
  maxEntries: number;
};

type CreateDrawInput = {
  slotNumber: number;
  drawDay: string;
  goLiveMode: "instant" | "schedule";
  startTime?: string;
  endTime?: string;
  prizes: DrawPrizeInput[];
};

type UpdateDrawInput = {
  title: string;
  description?: string;
  entryFee: number;
  prizeValue: number;
  imageUrl?: string;
  imageUrls?: string[];
  maxEntries: number;
  drawDay: string;
  goLiveMode: "instant" | "schedule";
  startTime?: string;
  endTime?: string;
  status?: string;
};

const OPEN_DRAW_STATUSES = ["draft", "available", "almost_filled", "closing_soon", "limited_slots", "filled"] as const;

type DrawPrizeImageRow = typeof drawPrizeImages.$inferSelect;

const mapDrawRows = (
  drawRows: Array<typeof draws.$inferSelect>,
  prizeRows: Array<typeof drawPrizes.$inferSelect>,
  imageRows: Array<DrawPrizeImageRow>,
  now = new Date(),
) =>
  drawRows.map((draw) => ({
    ...draw,
    prizes: prizeRows
      .filter((prize) => prize.drawId === draw.id)
      .map((prize) => ({
        ...prize,
        entryFee: toNumber(prize.entryFee),
        prizeValue: toNumber(prize.prizeValue),
        images: imageRows
          .filter((image) => image.drawPrizeId === prize.id)
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            imagePublicId: image.imagePublicId,
          })),
        urgencyStatus:
          prize.manualStatusOverride ||
          getAutomatedStatus(prize.currentEntries, prize.maxEntries, prize.endTime ?? draw.endTime ?? now, now),
      })),
  }));

const mapSingleDraw = (
  draw: typeof draws.$inferSelect,
  prizes: Array<typeof drawPrizes.$inferSelect>,
  imageRows: Array<DrawPrizeImageRow>,
  now = new Date(),
) => mapDrawRows([draw], prizes, imageRows, now)[0];

const getStartAndEndTimes = (goLiveMode: "instant" | "schedule", startTime?: string, endTime?: string) => {
  const resolvedStartTime = goLiveMode === "instant"
    ? new Date()
    : startTime
      ? new Date(startTime)
      : new Date();

  return {
    startTime: resolvedStartTime,
    endTime: endTime ? new Date(endTime) : null,
  };
};

const getDrawStatus = (goLiveMode: "instant" | "schedule", explicitStatus?: string) => {
  if (explicitStatus) {
    return explicitStatus;
  }

  return goLiveMode === "instant" ? "available" : "available";
};

const ensureSlotIsAvailable = async (tx: any, slotNumber: number, excludeDrawId?: string) => {
  // An advisory lock makes slot creation idempotent per slot across concurrent
  // requests, so double-clicks cannot create duplicate draws for the same slot.
  await tx.execute(sql`select pg_advisory_xact_lock(${slotNumber})`);

  const existingRows = await tx
    .select()
    .from(draws)
    .where(
      and(
        eq(draws.slotNumber, slotNumber),
        inArray(draws.status, [...OPEN_DRAW_STATUSES]),
        excludeDrawId ? ne(draws.id, excludeDrawId) : sql`true`,
      ),
    )
    .orderBy(desc(draws.createdAt))
    .limit(1);

  return existingRows[0] ?? null;
};

const normalizeImageUrls = (imageUrl?: string, imageUrls?: string[]) => {
  const nextUrls = [...(imageUrls ?? [])];
  if (imageUrl) {
    nextUrls.unshift(imageUrl);
  }

  return Array.from(new Set(nextUrls.filter(Boolean))).slice(0, 3);
};

const uploadPrizeImages = async (files: Express.Multer.File[] = [], fallbackUrls: string[] = []) => {
  if (!files.length) {
    return fallbackUrls.map((imageUrl) => ({
      imageUrl,
      imagePublicId: null as string | null,
    }));
  }

  const uploads = await Promise.all(
    files.slice(0, 3).map(async (file) => {
      const uploaded = await uploadBufferToCloudinary(file.buffer, "vissquest/draws", "image");
      return {
        imageUrl: uploaded.secure_url,
        imagePublicId: uploaded.public_id,
      };
    }),
  );

  return uploads;
};

export const drawsService = {
  async listActive(now = new Date()) {
    const [drawRows, prizeRows, imageRows] = await Promise.all([
      db.select().from(draws).orderBy(desc(draws.createdAt)),
      db.select().from(drawPrizes).orderBy(desc(drawPrizes.createdAt)),
      db.select().from(drawPrizeImages).orderBy(drawPrizeImages.sortOrder, desc(drawPrizeImages.createdAt)),
    ]);

    return mapDrawRows(
      drawRows.filter((draw) => {
        if (draw.status === "closed" || draw.status === "deleted") {
          return false;
        }

        if (draw.endTime && draw.endTime <= now) {
          return false;
        }

        if (draw.goLiveMode === "instant") {
          return true;
        }

        return draw.startTime ? draw.startTime <= now : true;
      }),
      prizeRows,
      imageRows,
      now,
    );
  },

  async listManaged(now = new Date()) {
    const [drawRows, prizeRows, imageRows] = await Promise.all([
      db.select().from(draws).where(ne(draws.status, "deleted")).orderBy(draws.slotNumber, desc(draws.createdAt)),
      db.select().from(drawPrizes).orderBy(desc(drawPrizes.createdAt)),
      db.select().from(drawPrizeImages).orderBy(drawPrizeImages.sortOrder, desc(drawPrizeImages.createdAt)),
    ]);

    return mapDrawRows(drawRows, prizeRows, imageRows, now);
  },

  async getById(drawId: string) {
    const [draw] = await db.select().from(draws).where(eq(draws.id, drawId)).limit(1);
    if (!draw) {
      throw new Error("Draw not found.");
    }

    const prizes = await db.select().from(drawPrizes).where(eq(drawPrizes.drawId, drawId));
    const imageRows = prizes.length
      ? await db.select().from(drawPrizeImages).where(inArray(drawPrizeImages.drawPrizeId, prizes.map((prize) => prize.id)))
      : [];
    return mapSingleDraw(draw, prizes, imageRows);
  },

  async create(input: CreateDrawInput, prizeImageFiles: Express.Multer.File[] = []) {
    return db.transaction(async (tx) => {
      const occupiedSlot = await ensureSlotIsAvailable(tx, input.slotNumber);
      if (occupiedSlot) {
        throw new Error(`Draw Slot ${input.slotNumber} is already occupied. Edit, close, or delete the existing draw first.`);
      }

      const { startTime, endTime } = getStartAndEndTimes(input.goLiveMode, input.startTime, input.endTime);
      const drawStatus = getDrawStatus(input.goLiveMode);

      const [draw] = await tx
        .insert(draws)
        .values({
          drawId: `VQD-${Date.now()}`,
          slotNumber: input.slotNumber,
          title: input.prizes[0]?.title || `${input.drawDay} Draw`,
          description: input.prizes[0]?.description || `${input.drawDay} scheduled draw`,
          drawDay: input.drawDay,
          goLiveMode: input.goLiveMode,
          startTime,
          endTime,
          status: drawStatus,
        })
        .returning();

      const prizesToInsert = [];
      const prizeImageSets: Array<Array<{ imageUrl: string; imagePublicId: string | null }>> = [];
      for (const [index, prize] of input.prizes.entries()) {
        const fallbackImageUrls = normalizeImageUrls(prize.imageUrl, prize.imageUrls);
        const imagePayloads = index === 0
          ? await uploadPrizeImages(prizeImageFiles, fallbackImageUrls)
          : fallbackImageUrls.map((imageUrl) => ({ imageUrl, imagePublicId: null as string | null }));

        if (!imagePayloads.length) {
          throw new Error("A valid draw image is required before publishing this draw.");
        }

        prizeImageSets[index] = imagePayloads;

        prizesToInsert.push({
          drawId: draw.id,
          title: prize.title,
          description: prize.description,
          entryFee: String(prize.entryFee),
          prizeValue: String(prize.prizeValue),
          imageUrl: imagePayloads[0]?.imageUrl ?? null,
          imagePublicId: imagePayloads[0]?.imagePublicId ?? null,
          maxEntries: prize.maxEntries,
          currentEntries: 0,
          urgencyStatus: drawStatus === "closed" ? "closed" : "available",
          startTime,
          endTime,
        });
      }

      const insertedPrizes = await tx.insert(drawPrizes).values(prizesToInsert).returning();
      const imageRowsToInsert = insertedPrizes.flatMap((prize, index) => {
        const images = prizeImageSets[index] ?? [];

        return images.filter((image) => image.imageUrl).map((image, imageIndex) => ({
          drawPrizeId: prize.id,
          imageUrl: image.imageUrl,
          imagePublicId: image.imagePublicId,
          sortOrder: imageIndex,
        }));
      });

      const insertedImageRows = imageRowsToInsert.length
        ? await tx.insert(drawPrizeImages).values(imageRowsToInsert).returning()
        : [];

      return mapSingleDraw(draw, insertedPrizes, insertedImageRows);
    });
  },

  async update(drawPrizeId: string, input: UpdateDrawInput, prizeImageFiles: Express.Multer.File[] = []) {
    return db.transaction(async (tx) => {
      const [prize] = await tx.select().from(drawPrizes).where(eq(drawPrizes.id, drawPrizeId)).limit(1);
      if (!prize) {
        throw new Error("Draw prize not found.");
      }

      const [draw] = await tx.select().from(draws).where(eq(draws.id, prize.drawId)).limit(1);
      if (!draw) {
        throw new Error("Draw not found.");
      }

      const { startTime, endTime } = getStartAndEndTimes(input.goLiveMode, input.startTime, input.endTime);
      const nextDrawStatus = getDrawStatus(input.goLiveMode, input.status);
      const existingImages = await tx
        .select()
        .from(drawPrizeImages)
        .where(eq(drawPrizeImages.drawPrizeId, prize.id))
        .orderBy(drawPrizeImages.sortOrder, desc(drawPrizeImages.createdAt));
      const fallbackImageUrls = normalizeImageUrls(input.imageUrl, input.imageUrls);
      const nextImages = prizeImageFiles.length
        ? await uploadPrizeImages(prizeImageFiles, fallbackImageUrls)
        : fallbackImageUrls.length
          ? fallbackImageUrls.map((imageUrl) => ({ imageUrl, imagePublicId: null as string | null }))
          : existingImages.length
            ? existingImages.map((image) => ({ imageUrl: image.imageUrl, imagePublicId: image.imagePublicId }))
            : normalizeImageUrls(prize.imageUrl ?? undefined).map((imageUrl) => ({ imageUrl, imagePublicId: prize.imagePublicId }));

      if (!nextImages.length) {
        throw new Error("A valid draw image is required before saving this draw.");
      }

      if (prizeImageFiles.length) {
        await Promise.all(existingImages.map((image) => destroyCloudinaryAsset(image.imagePublicId, "image")));
        await tx.delete(drawPrizeImages).where(eq(drawPrizeImages.drawPrizeId, prize.id));
      } else if (fallbackImageUrls.length) {
        await Promise.all(existingImages.map((image) => destroyCloudinaryAsset(image.imagePublicId, "image")));
        await tx.delete(drawPrizeImages).where(eq(drawPrizeImages.drawPrizeId, prize.id));
      }

      await tx
        .update(draws)
        .set({
          title: input.title,
          description: input.description,
          drawDay: input.drawDay,
          goLiveMode: input.goLiveMode,
          startTime,
          endTime,
          status: nextDrawStatus,
          updatedAt: new Date(),
        })
        .where(eq(draws.id, draw.id));

      const effectiveStatus = prize.manualStatusOverride || getAutomatedStatus(prize.currentEntries, input.maxEntries, endTime ?? startTime, new Date());
      await tx
        .update(drawPrizes)
        .set({
          title: input.title,
          description: input.description,
          entryFee: String(input.entryFee),
          prizeValue: String(input.prizeValue),
          imageUrl: nextImages[0]?.imageUrl ?? null,
          imagePublicId: nextImages[0]?.imagePublicId ?? null,
          maxEntries: input.maxEntries,
          startTime,
          endTime,
          urgencyStatus: nextDrawStatus === "closed" ? "closed" : effectiveStatus,
          manualStatusOverride: nextDrawStatus === "closed" ? "closed" : prize.manualStatusOverride,
        })
        .where(eq(drawPrizes.id, prize.id));

      if (prizeImageFiles.length || fallbackImageUrls.length) {
        await tx.insert(drawPrizeImages).values(
          nextImages.map((image, imageIndex) => ({
            drawPrizeId: prize.id,
            imageUrl: image.imageUrl,
            imagePublicId: image.imagePublicId,
            sortOrder: imageIndex,
          })),
        );
      }

      const updatedPrizes = await tx.select().from(drawPrizes).where(eq(drawPrizes.drawId, draw.id));
      const updatedImageRows = updatedPrizes.length
        ? await tx.select().from(drawPrizeImages).where(inArray(drawPrizeImages.drawPrizeId, updatedPrizes.map((item) => item.id)))
        : [];
      const [updatedDraw] = await tx.select().from(draws).where(eq(draws.id, draw.id)).limit(1);
      if (!updatedDraw) {
        throw new Error("Draw not found.");
      }

      return mapSingleDraw(updatedDraw, updatedPrizes, updatedImageRows);
    });
  },

  async delete(drawPrizeId: string) {
    return db.transaction(async (tx) => {
      const [prize] = await tx.select().from(drawPrizes).where(eq(drawPrizes.id, drawPrizeId)).limit(1);
      if (!prize) {
        throw new Error("Draw prize not found.");
      }

      const imageRows = await tx.select().from(drawPrizeImages).where(eq(drawPrizeImages.drawPrizeId, prize.id));
      await Promise.all(imageRows.map((image) => destroyCloudinaryAsset(image.imagePublicId, "image")));

      await tx.delete(draws).where(eq(draws.id, prize.drawId));
      return { success: true };
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

      if (nextEntries >= prize.maxEntries) {
        await tx.update(draws).set({ status: "filled", updatedAt: new Date() }).where(eq(draws.id, drawId));
      }

      return { success: true };
    });
  },

  async updateStatus(drawPrizeId: string, status: string) {
    return db.transaction(async (tx) => {
      const [prize] = await tx.select().from(drawPrizes).where(eq(drawPrizes.id, drawPrizeId)).limit(1);
      if (!prize) {
        throw new Error("Draw prize not found.");
      }

      await tx
        .update(drawPrizes)
        .set({
          manualStatusOverride: status === "auto" ? null : status,
          urgencyStatus: status === "auto" ? "available" : status,
        })
        .where(eq(drawPrizes.id, drawPrizeId));

      await tx
        .update(draws)
        .set({
          status: status === "auto" ? "available" : status,
          updatedAt: new Date(),
        })
        .where(eq(draws.id, prize.drawId));

      return { success: true };
    });
  },

  async closeNow(drawPrizeId: string) {
    return db.transaction(async (tx) => {
      const [prize] = await tx.select().from(drawPrizes).where(eq(drawPrizes.id, drawPrizeId)).limit(1);
      if (!prize) {
        throw new Error("Draw prize not found.");
      }

      await tx
        .update(drawPrizes)
        .set({ manualStatusOverride: "filled", urgencyStatus: "filled" })
        .where(eq(drawPrizes.id, drawPrizeId));

      await tx.update(draws).set({ status: "closed", updatedAt: new Date() }).where(eq(draws.id, prize.drawId));

      return { success: true };
    });
  },

  async closeExpired(now = new Date()) {
    const expiredPrizes = await db
      .select()
      .from(drawPrizes)
      .where(and(lte(drawPrizes.endTime, now), or(ne(drawPrizes.urgencyStatus, "closed"), eq(drawPrizes.urgencyStatus, "available"))));

    for (const prize of expiredPrizes) {
      await db
        .update(drawPrizes)
        .set({ urgencyStatus: "closed", manualStatusOverride: prize.manualStatusOverride ?? "closed" })
        .where(eq(drawPrizes.id, prize.id));

      await db.update(draws).set({ status: "closed", updatedAt: new Date() }).where(eq(draws.id, prize.drawId));
    }
  },
};
