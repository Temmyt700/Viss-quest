import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(8).optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
