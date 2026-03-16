import { desc } from "drizzle-orm";
import { db } from "../../db/client.js";
import { drawPrizes, winners } from "../../db/schema/index.js";

export const winnersService = {
  async list() {
    const winnerRows = await db.select().from(winners).orderBy(desc(winners.announcedAt));
    const prizeRows = await db.select().from(drawPrizes);

    return winnerRows.map((winner) => ({
      ...winner,
      imageUrl: prizeRows.find((prize) => prize.id === winner.drawPrizeId)?.imageUrl ?? null,
    }));
  },
};
