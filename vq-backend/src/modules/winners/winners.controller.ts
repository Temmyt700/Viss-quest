import type { Request, Response } from "express";
import { winnersService } from "./winners.service.js";

export const winnersController = {
  async list(_req: Request, res: Response) {
    const items = await winnersService.list();
    res.status(200).json({ winners: items });
  },
};
