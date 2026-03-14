import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { spinController } from "./spin.controller.js";
import { spinSchema } from "./spin.validation.js";

const router = Router();

router.use(requireAuth);
router.get("/status", asyncHandler(spinController.status));
router.post("/", validate(spinSchema), asyncHandler(spinController.spin));

export { router as spinRoutes };
