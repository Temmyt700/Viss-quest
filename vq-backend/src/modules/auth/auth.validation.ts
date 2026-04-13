import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    password: z.string().min(8),
    referralCode: z.string().trim().min(3).optional(),
    callbackURL: z.string().url().optional(),
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

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    redirectTo: z.string().url(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    callbackURL: z.string().url(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
