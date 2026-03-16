import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { quizController } from "./quiz.controller.js";
import { answerQuizSchema, createQuizSchema, updateQuizSchema } from "./quiz.validation.js";

const router = Router();

router.get("/scheduled", requireAuth, requireRole("admin"), asyncHandler(quizController.scheduled));
router.get("/today", asyncHandler(quizController.today));
router.get("/history", requireAuth, asyncHandler(quizController.history));
router.post("/answer", requireAuth, validate(answerQuizSchema), asyncHandler(quizController.answer));
router.post("/", requireAuth, requireRole("admin"), validate(createQuizSchema), asyncHandler(quizController.create));
router.patch("/:id", requireAuth, requireRole("admin"), validate(updateQuizSchema), asyncHandler(quizController.update));
router.post("/:id/publish", requireAuth, requireRole("admin"), asyncHandler(quizController.publish));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(quizController.remove));

export { router as quizRoutes };
