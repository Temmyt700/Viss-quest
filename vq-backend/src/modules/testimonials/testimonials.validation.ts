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
