import { z } from "zod";

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "suspended", "banned"]),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string(),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["user", "moderator", "admin"]),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string(),
  }),
});

export const walletAdjustmentSchema = z.object({
  body: z.object({
    userId: z.string(),
    amount: z.coerce.number(),
    reason: z.string().min(3),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
