import { index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.js";

export const referrals = pgTable("referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  referrerUserId: text("referrer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refereeUserId: text("referee_user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  referralCode: text("referral_code").notNull(),
  status: text("status").notNull().default("pending"),
  qualifyingFundingTotal: numeric("qualifying_funding_total", { precision: 12, scale: 2 }).notNull().default("0"),
  rewardAmount: numeric("reward_amount", { precision: 12, scale: 2 }).notNull().default("500"),
  qualifiedAt: timestamp("qualified_at", { withTimezone: true }),
  rewardedAt: timestamp("rewarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  referrerUserIdIdx: index("referrals_referrer_user_id_idx").on(table.referrerUserId),
  statusIdx: index("referrals_status_idx").on(table.status),
  createdAtIdx: index("referrals_created_at_idx").on(table.createdAt),
}));
