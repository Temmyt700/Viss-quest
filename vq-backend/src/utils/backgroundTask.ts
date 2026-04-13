import { logger } from "../config/logger.js";

export const runNonBlocking = (label: string, task: Promise<unknown> | void) => {
  if (!task || typeof (task as Promise<unknown>).catch !== "function") {
    return;
  }

  void (task as Promise<unknown>).catch((error) => {
    logger.warn(`${label} failed`, error);
  });
};
