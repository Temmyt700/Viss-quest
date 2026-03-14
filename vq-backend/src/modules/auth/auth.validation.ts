import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    password: z.string().min(8),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
