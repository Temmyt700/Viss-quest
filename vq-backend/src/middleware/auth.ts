import type { NextFunction, Request, Response } from "express";
import { auth } from "../config/auth.js";
import { db } from "../db/client.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { isDatabaseConnectivityError } from "../utils/databaseConnectivity.js";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  let session;
  try {
    session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });
  } catch (error) {
    res.status(503).json({ message: "Unable to verify your session right now. Please try again." });
    return;
  }

  if (!session?.user) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  let user;
  try {
    // Session validation and user hydration are separate steps, so we handle
    // DB outages here too and return a consistent service-unavailable response.
    [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      res.status(503).json({ message: "We could not reach the database right now. Please try again shortly." });
      return;
    }

    next(error);
    return;
  }

  if (!user) {
    res.status(401).json({ message: "Authenticated user was not found." });
    return;
  }

  req.authUser = user;
  req.authSession = session.session as Request["authSession"];
  next();
};
