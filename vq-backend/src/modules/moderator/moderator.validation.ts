import { z } from "zod";

export const moderationActionSchema = z.object({
  body: z.object({}),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});
