import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { banks } from "../../db/schema/index.js";

export const banksService = {
  async list() {
    return db.select().from(banks);
  },

  async create(input: { bankName: string; accountName: string; accountNumber: string }) {
    const [bank] = await db.insert(banks).values(input).returning();
    return bank;
  },

  async update(id: string, input: Partial<{ bankName: string; accountName: string; accountNumber: string }>) {
    const [bank] = await db.update(banks).set({ ...input, updatedAt: new Date() }).where(eq(banks.id, id)).returning();
    return bank;
  },

  async remove(id: string) {
    await db.delete(banks).where(eq(banks.id, id));
    return { success: true };
  },
};
