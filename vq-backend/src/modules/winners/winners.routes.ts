import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { winnersController } from "./winners.controller.js";

const router = Router();

router.get("/", asyncHandler(winnersController.list));

export { router as winnersRoutes };
