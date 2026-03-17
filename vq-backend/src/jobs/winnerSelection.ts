import { logger } from "../config/logger.js";
import { winnersService } from "../modules/winners/winners.service.js";

export const runWinnerSelection = async () => {
  const result = await winnersService.announceDuePending();
  logger.info(`Winner selection cycle completed. Announced ${result.processed} winner(s).`);
};
