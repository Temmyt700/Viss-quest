import type { NextFunction, Request, Response } from "express";
import { auth } from "../config/auth.js";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: req.headers as HeadersInit,
  });

  if (!session?.user) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  req.authUser = session.user as Request["authUser"];
  req.authSession = session.session as Request["authSession"];
  next();
};
