import type { Request, Response } from "express";
import { spinService } from "./spin.service.js";

export const spinController = {
  async status(req: Request, res: Response) {
    const status = await spinService.getStatus(req.authUser!.id);
    res.status(200).json(status);
  },

  async spin(req: Request, res: Response) {
    const result = await spinService.spin(req.authUser!.id);
    res.status(200).json(result);
  },
};
