import { index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.js";

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  createdAtIdx: index("wallets_created_at_idx").on(table.createdAt),
}));

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletId: uuid("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull(),
  reference: text("reference"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("wallet_transactions_user_id_idx").on(table.userId),
  walletIdIdx: index("wallet_transactions_wallet_id_idx").on(table.walletId),
  createdAtIdx: index("wallet_transactions_created_at_idx").on(table.createdAt),
  statusIdx: index("wallet_transactions_status_idx").on(table.status),
}));
