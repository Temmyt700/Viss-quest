import { index, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const draws = pgTable("draws", {
  id: uuid("id").defaultRandom().primaryKey(),
  drawId: text("draw_id").notNull().unique(),
  slotNumber: integer("slot_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  drawDay: text("draw_day"),
  goLiveMode: text("go_live_mode").notNull().default("instant"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slotIdx: index("draws_slot_number_idx").on(table.slotNumber),
  statusIdx: index("draws_status_idx").on(table.status),
  startTimeIdx: index("draws_start_time_idx").on(table.startTime),
  createdAtIdx: index("draws_created_at_idx").on(table.createdAt),
}));

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
  winnerCount: integer("winner_count").notNull().default(1),
  currentEntries: integer("current_entries").notNull().default(0),
  urgencyStatus: text("urgency_status").notNull().default("available"),
  manualStatusOverride: text("manual_status_override"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  drawIdIdx: index("draw_prizes_draw_id_idx").on(table.drawId),
  urgencyIdx: index("draw_prizes_urgency_status_idx").on(table.urgencyStatus),
  endTimeIdx: index("draw_prizes_end_time_idx").on(table.endTime),
  createdAtIdx: index("draw_prizes_created_at_idx").on(table.createdAt),
}));

export const drawEntries = pgTable("draw_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  drawId: uuid("draw_id").notNull().references(() => draws.id, { onDelete: "cascade" }),
  drawPrizeId: uuid("draw_prize_id").notNull().references(() => drawPrizes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  referenceId: text("reference_id").notNull(),
  entryFee: numeric("entry_fee", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  drawIdIdx: index("draw_entries_draw_id_idx").on(table.drawId),
  drawPrizeIdIdx: index("draw_entries_draw_prize_id_idx").on(table.drawPrizeId),
  userIdIdx: index("draw_entries_user_id_idx").on(table.userId),
  createdAtIdx: index("draw_entries_created_at_idx").on(table.createdAt),
}));

export const drawPrizeImages = pgTable("draw_prize_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  drawPrizeId: uuid("draw_prize_id").notNull().references(() => drawPrizes.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  drawPrizeIdIdx: index("draw_prize_images_draw_prize_id_idx").on(table.drawPrizeId),
  createdAtIdx: index("draw_prize_images_created_at_idx").on(table.createdAt),
}));

export const winners = pgTable("winners", {
  id: uuid("id").defaultRandom().primaryKey(),
  drawId: uuid("draw_id").notNull().references(() => draws.id, { onDelete: "cascade" }),
  drawPrizeId: uuid("draw_prize_id").notNull().references(() => drawPrizes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  referenceId: text("reference_id").notNull(),
  entryId: uuid("entry_id").references(() => drawEntries.id, { onDelete: "set null" }),
  prizeTitle: text("prize_title").notNull(),
  selectedAt: timestamp("selected_at", { withTimezone: true }).notNull().defaultNow(),
  announcedAt: timestamp("announced_at", { withTimezone: true }),
}, (table) => ({
  userIdIdx: index("winners_user_id_idx").on(table.userId),
  drawPrizeIdIdx: index("winners_draw_prize_id_idx").on(table.drawPrizeId),
  entryIdIdx: index("winners_entry_id_idx").on(table.entryId),
  selectedAtIdx: index("winners_selected_at_idx").on(table.selectedAt),
  announcedAtIdx: index("winners_announced_at_idx").on(table.announcedAt),
}));
