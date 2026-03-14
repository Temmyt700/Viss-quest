import { boolean, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const spinRewards = pgTable("spin_rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  rewardType: text("reward_type").notNull(),
  rewardAmount: numeric("reward_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  maxDailyWinners: integer("max_daily_winners").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const spinHistory = pgTable("spin_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  rewardId: uuid("reward_id").references(() => spinRewards.id),
  rewardAmount: numeric("reward_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  spinCost: numeric("spin_cost", { precision: 12, scale: 2 }).notNull(),
  spinDate: timestamp("spin_date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
