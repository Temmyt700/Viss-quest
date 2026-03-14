import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { notificationsController } from "./notifications.controller.js";
import { createNotificationSchema } from "./notifications.validation.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(notificationsController.list));
router.patch("/:id/read", asyncHandler(notificationsController.markRead));
router.post("/", requireRole("admin"), validate(createNotificationSchema), asyncHandler(notificationsController.create));

export { router as notificationsRoutes };
