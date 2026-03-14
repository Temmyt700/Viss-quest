import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { runDrawScheduler } from "./jobs/drawScheduler.js";
import { runQuizScheduler } from "./jobs/quizScheduler.js";
import { runWinnerSelection } from "./jobs/winnerSelection.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`VissQuest backend listening on port ${env.PORT}`);
});

// Lightweight local scheduler hooks. In production, move these to cron or a worker process.
setInterval(() => {
  void runDrawScheduler();
  void runQuizScheduler();
  void runWinnerSelection();
}, 60_000);
