import type { NextFunction, Request, Response } from "express";

type Role = "user" | "admin";

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Restricted routes now use a simple user/admin model in the app layer.
    const role = req.authUser?.role as Role | undefined;

    if (!role || !roles.includes(role)) {
      res.status(403).json({ message: "You do not have permission to perform this action." });
      return;
    }

    next();
  };
