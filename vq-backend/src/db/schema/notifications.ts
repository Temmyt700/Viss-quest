import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("system"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
}));

export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  fundingApproved: boolean("funding_approved").notNull().default(true),
  prizeWon: boolean("prize_won").notNull().default(true),
  referralReward: boolean("referral_reward").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
