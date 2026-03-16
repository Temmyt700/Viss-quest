import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";
import { getDatabaseConnectivityMessage, isDatabaseConnectivityError } from "../utils/databaseConnectivity.js";

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (isDatabaseConnectivityError(error)) {
    // Keep DB outage logs concise. The underlying query stack is not useful to
    // end users and tends to flood the terminal during temporary outages.
    logger.warn(getDatabaseConnectivityMessage(error));
    res.status(503).json({
      message: "The database is temporarily unavailable. Please try again in a moment.",
    });
    return;
  }

  logger.error(error.message, error);
  res.status(500).json({
    message: error.message || "Internal server error.",
  });
};
