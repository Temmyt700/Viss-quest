import { logger } from "../config/logger.js";
import { quizService } from "../modules/quiz/quiz.service.js";

export const runQuizScheduler = async () => {
  await quizService.syncActiveQuiz();
  logger.info("Quiz scheduler cycle completed.");
};
