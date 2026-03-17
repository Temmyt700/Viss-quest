import { z } from "zod";

export const createTestimonialSchema = z.object({
  body: z.object({
    prizeTitle: z.string().min(2),
    winningDate: z.string().datetime(),
    message: z.string().min(10),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateTestimonialSchema = z.object({
  body: z.object({
    prizeTitle: z.string().min(2).optional(),
    winningDate: z.string().datetime().optional(),
    message: z.string().min(10).optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const testimonialIdSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});
