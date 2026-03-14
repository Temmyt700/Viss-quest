import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(error.message, error);
  res.status(500).json({
    message: error.message || "Internal server error.",
  });
};
