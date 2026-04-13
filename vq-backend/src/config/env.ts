import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  ENABLE_SCHEDULER: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
  TELEGRAM_CHAT_ID: z.string().optional().default(""),
  ZEPTO_MAIL_API_KEY: z.string().optional().default(""),
  ZEPTO_MAIL_FROM_EMAIL: z.string().optional().default(""),
  ZEPTO_MAIL_FROM_NAME: z.string().optional().default("VissQuest"),
  WINNER_ANNOUNCEMENT_DELAY_MINUTES: z.coerce.number().int().min(5).max(15).default(10),
});

export const env = envSchema.parse(process.env);
