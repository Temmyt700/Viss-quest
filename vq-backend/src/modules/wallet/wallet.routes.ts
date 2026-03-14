import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { walletController } from "./wallet.controller.js";
import { walletTransactionQuerySchema } from "./wallet.validation.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(walletController.getWallet));
router.get("/transactions", validate(walletTransactionQuerySchema), asyncHandler(walletController.getTransactions));

export { router as walletRoutes };
