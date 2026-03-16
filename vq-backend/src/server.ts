import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { runDrawScheduler } from "./jobs/drawScheduler.js";
import { runQuizScheduler } from "./jobs/quizScheduler.js";
import { runWinnerSelection } from "./jobs/winnerSelection.js";
import { getDatabaseConnectivityMessage, isDatabaseConnectivityError } from "./utils/databaseConnectivity.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`VissQuest backend listening on port ${env.PORT}`);
});

const runSchedulerCycle = async () => {
  try {
    await Promise.all([runDrawScheduler(), runQuizScheduler(), runWinnerSelection()]);
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      logger.warn(`Scheduler skipped because the database is unreachable. ${getDatabaseConnectivityMessage(error)}`);
      return;
    }

    logger.error("Scheduler cycle failed.", error);
  }
};

// Disable the interval locally unless explicitly enabled. This avoids noisy DB churn during development.
if (env.ENABLE_SCHEDULER) {
  setInterval(() => {
    void runSchedulerCycle();
  }, 60_000);
}
