import type { Request, Response } from "express";
import { drawsService } from "./draws.service.js";
import { winnersService } from "../winners/winners.service.js";

export const drawsController = {
  async listActive(_req: Request, res: Response) {
    const draws = await drawsService.listActive();
    res.status(200).json({ draws, serverNow: new Date().toISOString() });
  },

  async listManaged(_req: Request, res: Response) {
    const draws = await drawsService.listManaged();
    res.status(200).json({ draws, serverNow: new Date().toISOString() });
  },

  async getById(req: Request, res: Response) {
    const draw = await drawsService.getById(req.params.drawId);
    res.status(200).json({ draw });
  },

  async enter(req: Request, res: Response) {
    const result = await drawsService.enter(req.params.drawId, req.body.drawPrizeId, req.authUser!.id);
    if (result.shouldPickWinner) {
      await winnersService.selectForDraw(req.params.drawId).catch(() => null);
    }
    res.status(200).json(result);
  },

  async create(req: Request, res: Response) {
    const draw = await drawsService.create(req.body, (req.files as Express.Multer.File[] | undefined) ?? []);
    res.status(201).json({ draw });
  },

  async update(req: Request, res: Response) {
    const draw = await drawsService.update(req.params.id, req.body, (req.files as Express.Multer.File[] | undefined) ?? []);
    res.status(200).json({ draw });
  },

  async updateStatus(req: Request, res: Response) {
    const result = await drawsService.updateStatus(req.params.id, req.body.status);
    if (req.body.status === "closed") {
      await winnersService.selectForDraw(req.params.id).catch(() => null);
    }
    res.status(200).json(result);
  },

  async closeNow(req: Request, res: Response) {
    const result = await drawsService.closeNow(req.params.id);
    await winnersService.selectForDraw(req.params.id).catch(() => null);
    res.status(200).json(result);
  },

  async remove(req: Request, res: Response) {
    const result = await drawsService.delete(req.params.id);
    res.status(200).json(result);
  },
};
