import type { Request, Response } from "express";
import { banksService } from "./banks.service.js";

export const banksController = {
  async list(_req: Request, res: Response) {
    const items = await banksService.list();
    res.status(200).json({ banks: items });
  },

  async create(req: Request, res: Response) {
    const bank = await banksService.create(req.body);
    res.status(201).json({ bank });
  },

  async update(req: Request, res: Response) {
    const bank = await banksService.update(req.params.id, req.body);
    res.status(200).json({ bank });
  },

  async remove(req: Request, res: Response) {
    const result = await banksService.remove(req.params.id);
    res.status(200).json(result);
  },
};
