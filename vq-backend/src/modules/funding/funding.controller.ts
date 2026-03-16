import type { Request, Response } from "express";
import { fundingService } from "./funding.service.js";

export const fundingController = {
  async create(req: Request, res: Response) {
    const request = await fundingService.create(req.authUser!.id, req.body.amount, req.file);
    res.status(201).json({ fundingRequest: request });
  },

  async listMine(req: Request, res: Response) {
    const items = await fundingService.listMine(req.authUser!.id);
    res.status(200).json({ fundingRequests: items });
  },

  async listPending(_req: Request, res: Response) {
    const items = await fundingService.listModerationQueue();
    res.status(200).json({ fundingRequests: items });
  },

  async approve(req: Request, res: Response) {
    const result = await fundingService.approve(req.params.id, req.authUser!.id);
    res.status(200).json(result);
  },

  async reject(req: Request, res: Response) {
    const result = await fundingService.reject(req.params.id, req.authUser!.id);
    res.status(200).json(result);
  },
};
