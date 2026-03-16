import type { Request, Response } from "express";
import { spinService } from "./spin.service.js";

export const spinController = {
  async config(_req: Request, res: Response) {
    const config = await spinService.getConfig();
    res.status(200).json(config);
  },

  async status(req: Request, res: Response) {
    const status = await spinService.getStatus(req.authUser!.id);
    res.status(200).json(status);
  },

  async spin(req: Request, res: Response) {
    const result = await spinService.spin(req.authUser!.id);
    res.status(200).json(result);
  },

  async settings(_req: Request, res: Response) {
    const settings = await spinService.getConfig();
    res.status(200).json(settings);
  },

  async updateSettings(req: Request, res: Response) {
    const settings = await spinService.updateSettings(req.body);
    res.status(200).json({ settings });
  },

  async updateReward(req: Request, res: Response) {
    const reward = await spinService.updateReward(req.params.id, req.body);
    res.status(200).json({ reward });
  },
};
