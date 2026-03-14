import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { quizController } from "./quiz.controller.js";
import { answerQuizSchema, createQuizSchema } from "./quiz.validation.js";

const router = Router();

router.get("/today", asyncHandler(quizController.today));
router.get("/history", requireAuth, asyncHandler(quizController.history));
router.post("/answer", requireAuth, validate(answerQuizSchema), asyncHandler(quizController.answer));
router.post("/", requireAuth, requireRole("admin"), validate(createQuizSchema), asyncHandler(quizController.create));

export { router as quizRoutes };
