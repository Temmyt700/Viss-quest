import { z } from "zod";

export const createBankSchema = z.object({
  body: z.object({
    bankName: z.string().min(2),
    accountName: z.string().min(2),
    accountNumber: z.string().min(6),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateBankSchema = z.object({
  body: z.object({
    bankName: z.string().min(2).optional(),
    accountName: z.string().min(2).optional(),
    accountNumber: z.string().min(6).optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});
