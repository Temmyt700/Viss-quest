import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { upload } from "../../middleware/upload.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { fundingController } from "./funding.controller.js";
import { createFundingRequestSchema } from "./funding.validation.js";

const router = Router();

router.use(requireAuth);
router.post("/requests", upload.single("paymentProof"), validate(createFundingRequestSchema), asyncHandler(fundingController.create));
router.get("/requests", asyncHandler(fundingController.listMine));
router.get("/moderation", requireRole("moderator", "admin"), asyncHandler(fundingController.listPending));
router.post("/moderation/:id/approve", requireRole("moderator", "admin"), asyncHandler(fundingController.approve));
router.post("/moderation/:id/reject", requireRole("moderator", "admin"), asyncHandler(fundingController.reject));

export { router as fundingRoutes };
