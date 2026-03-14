import { z } from "zod";

export const spinSchema = z.object({
  body: z.object({}),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
