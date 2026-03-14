import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { moderatorController } from "./moderator.controller.js";
import { moderationActionSchema } from "./moderator.validation.js";

const router = Router();

router.use(requireAuth, requireRole("moderator", "admin"));
router.get("/funding-requests", asyncHandler(moderatorController.listFundingRequests));
router.post("/funding-requests/:id/approve", validate(moderationActionSchema), asyncHandler(moderatorController.approveFunding));
router.post("/funding-requests/:id/reject", validate(moderationActionSchema), asyncHandler(moderatorController.rejectFunding));

export { router as moderatorRoutes };
