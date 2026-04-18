import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { adminController } from "./admin.controller.js";
import {
  updateReferralSettingsSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  walletAdjustmentSchema,
} from "./admin.validation.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/overview", asyncHandler(adminController.overview));
router.get("/users", asyncHandler(adminController.listUsers));
router.get("/participants", asyncHandler(adminController.participants));
router.get("/users/:id", asyncHandler(adminController.getUser));
router.patch("/users/:id/status", validate(updateUserStatusSchema), asyncHandler(adminController.updateUserStatus));
router.patch("/users/:id/role", validate(updateUserRoleSchema), asyncHandler(adminController.updateUserRole));
router.post("/wallet-adjustments", validate(walletAdjustmentSchema), asyncHandler(adminController.adjustWallet));
router.get("/wallet-stats", asyncHandler(adminController.walletStats));
router.get("/referrals", asyncHandler(adminController.referralInsights));
router.get("/referrals/settings", asyncHandler(adminController.referralSettings));
router.patch("/referrals/settings", validate(updateReferralSettingsSchema), asyncHandler(adminController.updateReferralSettings));
router.get("/draw-winners/pending", asyncHandler(adminController.pendingDrawWinners));
router.post("/draw-winners/:id/announce", asyncHandler(adminController.announcePendingWinner));
router.post("/draw-winners/:id/rerun", asyncHandler(adminController.rerunPendingWinner));

export { router as adminRoutes };
