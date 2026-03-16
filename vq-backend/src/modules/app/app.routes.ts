import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { appController } from "./app.controller.js";

const router = Router();

router.get("/home", asyncHandler(appController.home));
router.get("/dashboard", requireAuth, asyncHandler(appController.dashboard));
router.get("/daily-chances", requireAuth, asyncHandler(appController.dailyChances));
router.get("/admin-overview", requireAuth, requireRole("admin"), asyncHandler(appController.adminOverview));

export { router as appRoutes };
