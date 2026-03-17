import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { banks } from "../../db/schema/index.js";

const DEFAULT_BANKS = [
  {
    bankName: "Providus Bank",
    accountName: "VissQuest Technologies",
    accountNumber: "1234567890",
  },
  {
    bankName: "Moniepoint MFB",
    accountName: "VissQuest Collections",
    accountNumber: "1029384756",
  },
];

export const banksService = {
  async list() {
    const items = await db.select().from(banks);
    if (items.length) {
      return items;
    }

    // Funding should never fail with a blank bank section because the bank
    // table was cleared accidentally. Seed the default payout accounts back in
    // when the table is empty so the wallet flow stays usable.
    return db.insert(banks).values(DEFAULT_BANKS).returning();
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
