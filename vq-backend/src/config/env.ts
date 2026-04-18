import { config } from "dotenv";
import { z } from "zod";

config();

const trimmedInput = (value: unknown) =>
  typeof value === "string" ? value.trim() : value;

const trimmedRequiredString = () =>
  z.preprocess(
    trimmedInput,
    z.string().min(1),
  );

const trimmedUrl = () =>
  z.preprocess(
    trimmedInput,
    z.string().url(),
  );

const trimmedOptionalString = () =>
  z.preprocess(
    trimmedInput,
    z.string(),
  );

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  ENABLE_SCHEDULER: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  DATABASE_URL: trimmedRequiredString(),
  BETTER_AUTH_SECRET: trimmedRequiredString(),
  BETTER_AUTH_URL: trimmedUrl(),
  GOOGLE_CLIENT_ID: trimmedRequiredString(),
  GOOGLE_CLIENT_SECRET: trimmedRequiredString(),
  CLOUDINARY_CLOUD_NAME: trimmedRequiredString(),
  CLOUDINARY_API_KEY: trimmedRequiredString(),
  CLOUDINARY_API_SECRET: trimmedRequiredString(),
  FRONTEND_URL: trimmedUrl(),
  FRONTEND_ORIGINS: trimmedOptionalString().optional().default(""),
  TELEGRAM_BOT_TOKEN: trimmedOptionalString().optional().default(""),
  TELEGRAM_CHAT_ID: trimmedOptionalString().optional().default(""),
  ZEPTO_MAIL_API_KEY: trimmedOptionalString().optional().default(""),
  ZEPTO_MAIL_FROM_EMAIL: trimmedOptionalString().optional().default(""),
  ZEPTO_MAIL_FROM_NAME: trimmedOptionalString().optional().default("VissQuest"),
  WINNER_ANNOUNCEMENT_DELAY_MINUTES: z.coerce.number().int().min(5).max(15).default(10),
});

export const env = envSchema.parse(process.env);
