import { desc } from "drizzle-orm";
import { db } from "../../db/client.js";
import { winners } from "../../db/schema/index.js";

export const winnersService = {
  async list() {
    return db.select().from(winners).orderBy(desc(winners.announcedAt));
  },
};
