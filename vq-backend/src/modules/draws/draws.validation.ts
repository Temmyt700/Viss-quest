import { z } from "zod";

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
    drawDay: z.string().min(3),
    goLiveMode: z.enum(["instant", "schedule"]),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    prizes: z.array(
      z.object({
        title: z.string().min(2),
        description: z.string().optional(),
        entryFee: z.coerce.number().positive(),
        prizeValue: z.coerce.number().positive(),
        imageUrl: z.string().url().optional(),
        maxEntries: z.coerce.number().int().positive(),
      }),
    ).min(1),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateDrawStatusSchema = z.object({
  body: z.object({
    status: z.enum(["auto", "available", "almost_filled", "closing_soon", "limited_slots", "filled", "closed"]),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});
