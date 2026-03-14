import { z } from "zod";

export const answerQuizSchema = z.object({
  body: z.object({
    quizId: z.string().uuid(),
    selectedOption: z.enum(["A", "B", "C", "D"]),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const createQuizSchema = z.object({
  body: z.object({
    question: z.string().min(4),
    optionA: z.string().min(1),
    optionB: z.string().min(1),
    optionC: z.string().min(1),
    optionD: z.string().min(1),
    correctAnswer: z.enum(["A", "B", "C", "D"]),
    rewardAmount: z.coerce.number().positive(),
    goLiveMode: z.enum(["instant", "schedule"]),
    scheduledAt: z.string().datetime().optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
