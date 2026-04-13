import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../config/auth.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authController } from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(authController.register));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
router.post("/resend-verification", validate(resendVerificationSchema), asyncHandler(authController.resendVerification));
router.post("/logout", requireAuth, asyncHandler(authController.logout));
router.get("/profile", requireAuth, asyncHandler(authController.profile));
router.all("/better-auth/*", toNodeHandler(auth));

export { router as authRoutes };
