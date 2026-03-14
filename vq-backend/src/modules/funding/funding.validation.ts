import { z } from "zod";

export const createFundingRequestSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(500),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
