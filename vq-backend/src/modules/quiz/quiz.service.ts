import { and, desc, eq, lte, ne } from "drizzle-orm";
import { db } from "../../db/client.js";
import { quizAttempts, quizzes, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { addHours } from "../../utils/time.js";
import { toNumber } from "../../utils/money.js";

type QuizInput = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  rewardAmount: number;
  goLiveMode: "instant" | "schedule";
  scheduledAt?: string;
};

const mapQuizStatus = (quiz: typeof quizzes.$inferSelect, now = new Date()) => {
  const activeFrom = quiz.activeFrom ?? quiz.scheduledAt;
  const activeUntil = quiz.activeUntil;

  if (quiz.isActive && activeUntil && activeUntil < now) {
    return "expired";
  }

  if (quiz.isActive && activeFrom && activeFrom <= now) {
    return "active";
  }

  if (activeFrom && activeFrom > now) {
    return "scheduled";
  }

  return quiz.goLiveMode === "instant" ? "draft" : "scheduled";
};

export const quizService = {
  async syncActiveQuiz(now = new Date()) {
    // Always prefer the newest eligible quiz. If a newly scheduled quiz goes
    // live, it should replace the older active quiz immediately.
    const nextQuiz = await db
      .select()
      .from(quizzes)
      .where(lte(quizzes.activeFrom, now))
      .orderBy(desc(quizzes.activeFrom), desc(quizzes.createdAt))
      .limit(1);

    const [currentQuiz] = nextQuiz;
    const currentActiveId = currentQuiz?.id ?? null;

    if (currentActiveId) {
      await db
        .update(quizzes)
        .set({ isActive: false })
        .where(and(eq(quizzes.isActive, true), ne(quizzes.id, currentActiveId)));
    } else {
      await db
        .update(quizzes)
        .set({ isActive: false })
        .where(eq(quizzes.isActive, true));
    }

    if (!currentQuiz) {
      return null;
    }

    const isWithinWindow = !currentQuiz.activeUntil || currentQuiz.activeUntil > now;
    if (!isWithinWindow) {
      await db.update(quizzes).set({ isActive: false }).where(eq(quizzes.id, currentQuiz.id));
      return null;
    }

    if (!currentQuiz.isActive) {
      await db.update(quizzes).set({ isActive: true }).where(eq(quizzes.id, currentQuiz.id));
      return {
        ...currentQuiz,
        isActive: true,
      };
    }

    return currentQuiz;
  },

  async listScheduled() {
    const now = new Date();
    const quizRows = await db.select().from(quizzes).orderBy(desc(quizzes.activeFrom), desc(quizzes.createdAt));

    return quizRows.map((quiz) => ({
      ...quiz,
      status: mapQuizStatus(quiz, now),
    }));
  },

  async getById(quizId: string) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
    if (!quiz) {
      throw new Error("Quiz not found.");
    }

    return {
      ...quiz,
      status: mapQuizStatus(quiz),
    };
  },

  async getToday() {
    await this.syncActiveQuiz();

    const now = new Date();
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.isActive, true), lte(quizzes.activeFrom, now)))
      .orderBy(desc(quizzes.activeFrom), desc(quizzes.createdAt))
      .limit(1);

    return quiz ?? null;
  },

  async answer(userId: string, quizId: string, selectedOption: "A" | "B" | "C" | "D") {
    return db.transaction(async (tx) => {
      const [quiz] = await tx.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
      const now = new Date();
      const isAvailable = quiz && quiz.isActive && (!quiz.activeUntil || quiz.activeUntil > now);

      if (!quiz || !isAvailable) {
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

  async create(input: QuizInput) {
    const activeFrom = input.goLiveMode === "instant" ? new Date() : new Date(input.scheduledAt!);
    const activeUntil = addHours(activeFrom, 24);

    if (input.goLiveMode === "instant") {
      await db.update(quizzes).set({ isActive: false }).where(eq(quizzes.isActive, true));
    }

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

  async update(quizId: string, input: QuizInput) {
    const activeFrom = input.goLiveMode === "instant" ? new Date() : new Date(input.scheduledAt!);
    const activeUntil = addHours(activeFrom, 24);

    if (input.goLiveMode === "instant") {
      await db.update(quizzes).set({ isActive: false }).where(and(eq(quizzes.isActive, true), ne(quizzes.id, quizId)));
    }

    const [quiz] = await db
      .update(quizzes)
      .set({
        ...input,
        rewardAmount: String(input.rewardAmount),
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        activeFrom,
        activeUntil,
        isActive: input.goLiveMode === "instant",
      })
      .where(eq(quizzes.id, quizId))
      .returning();

    return quiz;
  },

  async publishNow(quizId: string) {
    const now = new Date();
    await db.update(quizzes).set({ isActive: false }).where(and(eq(quizzes.isActive, true), ne(quizzes.id, quizId)));

    const [quiz] = await db
      .update(quizzes)
      .set({
        goLiveMode: "instant",
        scheduledAt: now,
        activeFrom: now,
        activeUntil: addHours(now, 24),
        isActive: true,
      })
      .where(eq(quizzes.id, quizId))
      .returning();

    return quiz;
  },

  async remove(quizId: string) {
    await db.delete(quizzes).where(eq(quizzes.id, quizId));
    return { success: true };
  },
};
