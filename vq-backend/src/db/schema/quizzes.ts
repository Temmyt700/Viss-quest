import { boolean, index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  rewardAmount: numeric("reward_amount", { precision: 12, scale: 2 }).notNull(),
  goLiveMode: text("go_live_mode").notNull().default("instant"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  activeFrom: timestamp("active_from", { withTimezone: true }),
  activeUntil: timestamp("active_until", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  isActiveIdx: index("quizzes_is_active_idx").on(table.isActive),
  activeFromIdx: index("quizzes_active_from_idx").on(table.activeFrom),
  scheduledAtIdx: index("quizzes_scheduled_at_idx").on(table.scheduledAt),
  createdAtIdx: index("quizzes_created_at_idx").on(table.createdAt),
}));

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  selectedOption: text("selected_option").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  rewardAmount: numeric("reward_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("quiz_attempts_user_id_idx").on(table.userId),
  quizIdIdx: index("quiz_attempts_quiz_id_idx").on(table.quizId),
  attemptedAtIdx: index("quiz_attempts_attempted_at_idx").on(table.attemptedAt),
}));
