import { z } from "zod";

const optionalIsoDate = z.preprocess((value) => (value === "" ? undefined : value), z.string().datetime().optional());
const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());
const drawPrizeSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  entryFee: z.coerce.number().positive(),
  prizeValue: z.coerce.number().positive(),
  imageUrl: optionalUrl,
  imageUrls: z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      if (typeof value === "string") {
        return JSON.parse(value);
      }

      return value;
    },
    z.array(z.string().url()).max(3).optional(),
  ),
  maxEntries: z.coerce.number().int().positive(),
  winnerCount: z.coerce.number().int().min(1).max(50),
});

export const enterDrawSchema = z.object({
  body: z.object({
    drawPrizeId: z.string().uuid(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    drawId: z.string().uuid(),
  }),
});

export const createDrawSchema = z.object({
  body: z.object({
    slotNumber: z.coerce.number().int().min(1).max(3),
    drawDay: z.string().min(3),
    goLiveMode: z.enum(["instant", "schedule"]),
    startTime: optionalIsoDate,
    endTime: optionalIsoDate,
    prizes: z.preprocess(
      (value) => (typeof value === "string" ? JSON.parse(value) : value),
      z.array(drawPrizeSchema).min(1),
    ),
  }).superRefine((data, ctx) => {
    if (!data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time is required.",
      });
    }

    if (data.goLiveMode === "schedule" && !data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Start time is required for scheduled draws.",
      });
    }
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateDrawSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    entryFee: z.coerce.number().positive(),
    prizeValue: z.coerce.number().positive(),
    imageUrl: optionalUrl,
    imageUrls: z.preprocess(
      (value) => {
        if (value === "" || value == null) return undefined;
        if (typeof value === "string") {
          return JSON.parse(value);
        }

        return value;
      },
      z.array(z.string().url()).max(3).optional(),
    ),
    maxEntries: z.coerce.number().int().positive(),
    winnerCount: z.coerce.number().int().min(1).max(50),
    drawDay: z.string().min(3),
    goLiveMode: z.enum(["instant", "schedule"]),
    startTime: optionalIsoDate,
    endTime: optionalIsoDate,
    status: z.enum(["active", "draft", "available", "almost_filled", "closing_soon", "limited_slots", "filled", "closed", "winner_pending", "winner_announced"]).optional(),
  }).superRefine((data, ctx) => {
    if (!data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time is required.",
      });
    }

    if (data.goLiveMode === "schedule" && !data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Start time is required for scheduled draws.",
      });
    }
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateDrawStatusSchema = z.object({
  body: z.object({
    status: z.enum(["auto", "active", "available", "almost_filled", "closing_soon", "limited_slots", "filled", "closed", "winner_pending", "winner_announced"]),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});
