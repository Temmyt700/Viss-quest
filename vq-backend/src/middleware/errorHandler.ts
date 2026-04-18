import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";
import { getDatabaseConnectivityMessage, isDatabaseConnectivityError } from "../utils/databaseConnectivity.js";
import { isServiceUnavailableFailure } from "../utils/serviceAvailability.js";

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (isDatabaseConnectivityError(error)) {
    // Keep DB outage logs concise. The underlying query stack is not useful to
    // end users and tends to flood the terminal during temporary outages.
    logger.warn(getDatabaseConnectivityMessage(error));
    res.status(503).json({
      message: "Service is temporarily unavailable right now. Please try again in a moment.",
    });
    return;
  }

  if (isServiceUnavailableFailure(error)) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 503;
    const code = (error as { code?: string }).code ?? "SERVICE_UNAVAILABLE";
    const message = error.message || "Service is temporarily unavailable right now. Please retry.";

    logger.warn(error.message, error);
    res.status(statusCode).json({
      message,
      code,
    });
    return;
  }

  logger.error(error.message, error);
  const safeMessage = error.message && !/failed query|select\s|insert\s|update\s|delete\s|drizzlequeryerror/i.test(error.message)
    ? error.message
    : "Something went wrong. Please try again.";
  res.status(500).json({ message: safeMessage });
};
