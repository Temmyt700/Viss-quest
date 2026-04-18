import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail.js";
import { createRateLimit } from "../../middleware/rateLimit.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { spinController } from "./spin.controller.js";
import { spinSchema, updateSpinRewardSchema, updateSpinSettingsSchema } from "./spin.validation.js";

const router = Router();

router.get("/config", asyncHandler(spinController.config));

router.use(requireAuth);
router.get("/status", asyncHandler(spinController.status));
router.post(
  "/",
  requireVerifiedEmail,
  createRateLimit({
    windowMs: 10_000,
    maxRequests: 3,
    keyPrefix: "spin",
    getKey: (req) => req.authUser?.id ?? null,
    message: "Too many spin attempts. Please wait a moment before trying again.",
  }),
  validate(spinSchema),
  asyncHandler(spinController.spin),
);
router.get("/settings", requireRole("admin"), asyncHandler(spinController.settings));
router.patch("/settings", requireRole("admin"), validate(updateSpinSettingsSchema), asyncHandler(spinController.updateSettings));
router.patch("/rewards/:id", requireRole("admin"), validate(updateSpinRewardSchema), asyncHandler(spinController.updateReward));

export { router as spinRoutes };
