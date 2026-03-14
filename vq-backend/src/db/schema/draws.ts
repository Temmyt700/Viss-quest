import { integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const draws = pgTable("draws", {
  id: uuid("id").defaultRandom().primaryKey(),
  drawId: text("draw_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  drawDay: text("draw_day"),
  goLiveMode: text("go_live_mode").notNull().default("instant"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const drawPrizes = pgTable("draw_prizes", {
  id: uuid("id").defaultRandom().primaryKey(),
  drawId: uuid("draw_id").notNull().references(() => draws.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  entryFee: numeric("entry_fee", { precision: 12, scale: 2 }).notNull(),
  prizeValue: numeric("prize_value", { precision: 12, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  imagePublicId: text("image_public_id"),
  maxEntries: integer("max_entries").notNull(),
  currentEntries: integer("current_entries").notNull().default(0),
  urgencyStatus: text("urgency_status").notNull().default("available"),
  manualStatusOverride: text("manual_status_override"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const drawEntries = pgTable("draw_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  drawId: uuid("draw_id").notNull().references(() => draws.id, { onDelete: "cascade" }),
  drawPrizeId: uuid("draw_prize_id").notNull().references(() => drawPrizes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  referenceId: text("reference_id").notNull(),
  entryFee: numeric("entry_fee", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const winners = pgTable("winners", {
  id: uuid("id").defaultRandom().primaryKey(),
  drawId: uuid("draw_id").notNull().references(() => draws.id, { onDelete: "cascade" }),
  drawPrizeId: uuid("draw_prize_id").notNull().references(() => drawPrizes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  referenceId: text("reference_id").notNull(),
  prizeTitle: text("prize_title").notNull(),
  announcedAt: timestamp("announced_at", { withTimezone: true }).notNull().defaultNow(),
});
