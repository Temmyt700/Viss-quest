import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  referenceId: text("reference_id").notNull(),
  prizeTitle: text("prize_title").notNull(),
  winningDate: timestamp("winning_date", { withTimezone: true }).notNull(),
  message: text("message").notNull(),
  isApproved: boolean("is_approved").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testimonialImages = pgTable("testimonial_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  testimonialId: uuid("testimonial_id").notNull().references(() => testimonials.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
