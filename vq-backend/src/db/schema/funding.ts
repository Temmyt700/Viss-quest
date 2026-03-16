import { index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.js";

export const fundingRequests = pgTable("funding_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referenceId: text("reference_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  proofUrl: text("proof_url"),
  proofPublicId: text("proof_public_id"),
  status: text("status").notNull().default("pending"),
  reviewedByUserId: text("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("funding_requests_user_id_idx").on(table.userId),
  statusIdx: index("funding_requests_status_idx").on(table.status),
  createdAtIdx: index("funding_requests_created_at_idx").on(table.createdAt),
}));

export const banks = pgTable("banks", {
  id: uuid("id").defaultRandom().primaryKey(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
