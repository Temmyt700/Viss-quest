import type { users } from "../db/schema/index.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: typeof users.$inferSelect;
      authSession?: {
        id: string;
        userId: string;
      };
    }
  }
}

export {};
