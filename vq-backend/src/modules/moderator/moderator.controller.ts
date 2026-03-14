import type { Request, Response } from "express";
import { moderatorService } from "./moderator.service.js";

export const moderatorController = {
  async listFundingRequests(_req: Request, res: Response) {
    const fundingRequests = await moderatorService.listFundingRequests();
    res.status(200).json({ fundingRequests });
  },

  async approveFunding(req: Request, res: Response) {
    const result = await moderatorService.approveFunding(req.params.id, req.authUser!.id);
    res.status(200).json(result);
  },

  async rejectFunding(req: Request, res: Response) {
    const result = await moderatorService.rejectFunding(req.params.id, req.authUser!.id);
    res.status(200).json(result);
  },
};
