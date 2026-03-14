import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { usersController } from "./users.controller.js";
import { updateProfileSchema } from "./users.validation.js";

const router = Router();

router.use(requireAuth);
router.get("/me", asyncHandler(usersController.me));
router.patch("/me", validate(updateProfileSchema), asyncHandler(usersController.updateMe));
router.get("/me/dashboard", asyncHandler(usersController.dashboard));
router.get("/me/notifications", asyncHandler(usersController.notifications));

export { router as usersRoutes };
