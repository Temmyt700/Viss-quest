import type { Request, Response } from "express";
import { testimonialsService } from "./testimonials.service.js";

export const testimonialsController = {
  async list(_req: Request, res: Response) {
    const items = await testimonialsService.list();
    res.status(200).json({ testimonials: items });
  },

  async create(req: Request, res: Response) {
    const testimonial = await testimonialsService.create(
      req.authUser!.id,
      req.body,
      Array.isArray(req.files) ? req.files : [],
    );
    res.status(201).json({ testimonial });
  },
};
