import { z } from "zod";

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    title: z.string().min(2),
    message: z.string().min(4),
    type: z.string().min(2).optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateNotificationSettingsSchema = z.object({
  body: z.object({
    fundingApproved: z.boolean().optional(),
    prizeWon: z.boolean().optional(),
    referralReward: z.boolean().optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
