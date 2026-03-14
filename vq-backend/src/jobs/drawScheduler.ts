import { drawsService } from "../modules/draws/draws.service.js";
import { logger } from "../config/logger.js";

export const runDrawScheduler = async () => {
  await drawsService.closeExpired();
  logger.info("Draw scheduler cycle completed.");
};
