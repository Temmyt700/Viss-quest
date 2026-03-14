import type { Request, Response } from "express";
import { notificationsService } from "./notifications.service.js";

export const notificationsController = {
  async list(req: Request, res: Response) {
    const items = await notificationsService.list(req.authUser!.id);
    res.status(200).json({ notifications: items });
  },

  async create(req: Request, res: Response) {
    const notification = await notificationsService.create(req.body);
    res.status(201).json({ notification });
  },

  async markRead(req: Request, res: Response) {
    const result = await notificationsService.markRead(req.params.id, req.authUser!.id);
    res.status(200).json(result);
  },
};
