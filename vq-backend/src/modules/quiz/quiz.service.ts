import { and, desc, eq, lte } from "drizzle-orm";
import { db } from "../../db/client.js";
import { quizAttempts, quizzes, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { addHours } from "../../utils/time.js";
import { toNumber } from "../../utils/money.js";

export const quizService = {
  async getToday() {
    const now = new Date();
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.isActive, true), lte(quizzes.activeFrom, now)))
      .orderBy(desc(quizzes.createdAt))
      .limit(1);
    return quiz;
  },

  async answer(userId: string, quizId: string, selectedOption: "A" | "B" | "C" | "D") {
    return db.transaction(async (tx) => {
      const [quiz] = await tx.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
      if (!quiz || !quiz.isActive) {
        throw new Error("Quiz is not active.");
      }

      const [existingAttempt] = await tx
        .select()
        .from(quizAttempts)
        .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)))
        .limit(1);

      if (existingAttempt) {
        throw new Error("You have already answered this quiz.");
      }

      const isCorrect = quiz.correctAnswer === selectedOption;
      const rewardAmount = isCorrect ? toNumber(quiz.rewardAmount) : 0;

      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!wallet || !user) {
        throw new Error("Wallet not found.");
      }

      if (isCorrect) {
        await tx
          .update(wallets)
          .set({ balance: String(toNumber(wallet.balance) + rewardAmount), updatedAt: new Date() })
          .where(eq(wallets.id, wallet.id));

        await tx.insert(walletTransactions).values({
          userId,
          walletId: wallet.id,
          type: "quiz_reward",
          amount: String(rewardAmount),
          status: "completed",
          reference: user.referenceId ?? undefined,
          description: `Quiz reward for quiz ${quiz.id}`,
        });
      }

      await tx.insert(quizAttempts).values({
        userId,
        quizId,
        selectedOption,
        isCorrect,
        rewardAmount: String(rewardAmount),
      });

      return { isCorrect, rewardAmount };
    });
  },

  async history(userId: string) {
    return db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.attemptedAt));
  },

  async create(input: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: "A" | "B" | "C" | "D";
    rewardAmount: number;
    goLiveMode: "instant" | "schedule";
    scheduledAt?: string;
  }) {
    const activeFrom = input.goLiveMode === "instant" ? new Date() : new Date(input.scheduledAt!);
    const activeUntil = addHours(activeFrom, 24);

    const [quiz] = await db
      .insert(quizzes)
      .values({
        ...input,
        rewardAmount: String(input.rewardAmount),
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        activeFrom,
        activeUntil,
        isActive: input.goLiveMode === "instant",
      })
      .returning();

    return quiz;
  },
};
