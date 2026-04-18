import { boolean, numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const referralSettings = pgTable("referral_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  isActive: boolean("is_active").notNull().default(true),
  rewardAmount: numeric("reward_amount", { precision: 12, scale: 2 }).notNull().default("500"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

