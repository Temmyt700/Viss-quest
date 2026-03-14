import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { banksController } from "./banks.controller.js";
import { createBankSchema, updateBankSchema } from "./banks.validation.js";

const router = Router();

router.get("/", asyncHandler(banksController.list));
router.post("/", requireAuth, requireRole("admin"), validate(createBankSchema), asyncHandler(banksController.create));
router.patch("/:id", requireAuth, requireRole("admin"), validate(updateBankSchema), asyncHandler(banksController.update));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(banksController.remove));

export { router as banksRoutes };
