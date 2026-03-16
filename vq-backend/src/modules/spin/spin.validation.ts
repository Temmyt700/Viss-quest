import { z } from "zod";

export const spinSchema = z.object({
  body: z.object({}),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateSpinSettingsSchema = z.object({
  body: z.object({
    spinCost: z.coerce.number().nonnegative(),
    maxDailyPayout: z.coerce.number().nonnegative(),
    maxSingleReward: z.coerce.number().nonnegative(),
    dailySpinLimit: z.coerce.number().int().positive(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateSpinRewardSchema = z.object({
  body: z.object({
    label: z.string().min(1).optional(),
    rewardType: z.enum(["cash", "free_entry", "none"]).optional(),
    rewardAmount: z.coerce.number().nonnegative().optional(),
    maxDailyWinners: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});
