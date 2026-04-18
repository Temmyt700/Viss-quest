import type { NextFunction, Request, Response } from "express";

export const requireVerifiedEmail = (req: Request, res: Response, next: NextFunction) => {
  if (!req.authUser) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  // Participation actions are restricted until verification to keep account
  // ownership checks strict while still allowing users to browse after login.
  if (!req.authUser.emailVerified) {
    res.status(403).json({
      message: "Please verify your email to participate.",
      code: "EMAIL_NOT_VERIFIED",
    });
    return;
  }

  next();
};

