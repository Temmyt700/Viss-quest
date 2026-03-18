import { z } from "zod";

export const spinSchema = z.object({
  body: z.object({}),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateSpinSettingsSchema = z.object({
  body: z.object({
    spinCost: z.coerce.number().finite().nonnegative(),
    maxDailyPayout: z.coerce.number().finite().nonnegative(),
    maxSingleReward: z.coerce.number().finite().nonnegative(),
    dailySpinLimit: z.coerce.number().finite().int().positive(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateSpinRewardSchema = z.object({
  body: z.object({
    label: z.string().trim().min(1).max(80).optional(),
    rewardType: z.enum(["cash", "free_entry", "none", "try_again"]).optional(),
    rewardAmount: z.coerce.number().finite().nonnegative().optional(),
    maxDailyWinners: z.coerce.number().finite().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});
