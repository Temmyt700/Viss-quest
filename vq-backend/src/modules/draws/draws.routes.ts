import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail.js";
import { requireRole } from "../../middleware/requireRole.js";
import { upload } from "../../middleware/upload.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { drawsController } from "./draws.controller.js";
import { createDrawSchema, enterDrawSchema, updateDrawSchema, updateDrawStatusSchema } from "./draws.validation.js";

const router = Router();

router.get("/active", asyncHandler(drawsController.listActive));
router.get("/manage", requireAuth, requireRole("admin"), asyncHandler(drawsController.listManaged));
router.get("/:drawId", asyncHandler(drawsController.getById));
router.post("/:drawId/enter", requireAuth, requireVerifiedEmail, validate(enterDrawSchema), asyncHandler(drawsController.enter));

router.post("/", requireAuth, requireRole("admin"), upload.array("images", 3), validate(createDrawSchema), asyncHandler(drawsController.create));
router.patch("/:id", requireAuth, requireRole("admin"), upload.array("images", 3), validate(updateDrawSchema), asyncHandler(drawsController.update));
router.patch("/:id/status", requireAuth, requireRole("admin"), validate(updateDrawStatusSchema), asyncHandler(drawsController.updateStatus));
router.post("/:id/close", requireAuth, requireRole("admin"), asyncHandler(drawsController.closeNow));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(drawsController.remove));

export { router as drawsRoutes };
