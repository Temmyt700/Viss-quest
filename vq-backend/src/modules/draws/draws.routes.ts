import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { drawsController } from "./draws.controller.js";
import { createDrawSchema, enterDrawSchema, updateDrawStatusSchema } from "./draws.validation.js";

const router = Router();

router.get("/active", asyncHandler(drawsController.listActive));
router.get("/:drawId", asyncHandler(drawsController.getById));
router.post("/:drawId/enter", requireAuth, validate(enterDrawSchema), asyncHandler(drawsController.enter));

router.post("/", requireAuth, requireRole("admin"), validate(createDrawSchema), asyncHandler(drawsController.create));
router.patch("/:id/status", requireAuth, requireRole("admin"), validate(updateDrawStatusSchema), asyncHandler(drawsController.updateStatus));
router.post("/:id/close", requireAuth, requireRole("admin"), asyncHandler(drawsController.closeNow));

export { router as drawsRoutes };
