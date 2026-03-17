import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { upload } from "../../middleware/upload.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { testimonialsController } from "./testimonials.controller.js";
import { createTestimonialSchema, testimonialIdSchema, updateTestimonialSchema } from "./testimonials.validation.js";

const router = Router();

router.get("/", asyncHandler(testimonialsController.list));
router.post("/", requireAuth, upload.array("images", 3), validate(createTestimonialSchema), asyncHandler(testimonialsController.create));
router.patch("/:id", requireAuth, upload.array("images", 3), validate(updateTestimonialSchema), asyncHandler(testimonialsController.update));
router.delete("/:id", requireAuth, validate(testimonialIdSchema), asyncHandler(testimonialsController.remove));

export { router as testimonialsRoutes };
