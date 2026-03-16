import type { Request, Response } from "express";
import { notificationsService } from "./notifications.service.js";

export const notificationsController = {
  async list(req: Request, res: Response) {
    const items = await notificationsService.list(req.authUser!.id);
    res.status(200).json({ notifications: items });
  },

  async getSettings(_req: Request, res: Response) {
    const settings = await notificationsService.getSettings();
    res.status(200).json({ settings });
  },

  async create(req: Request, res: Response) {
    const notification = req.body.userId
      ? await notificationsService.create(req.body)
      : await notificationsService.broadcast(req.body);
    res.status(201).json({ notification });
  },

  async updateSettings(req: Request, res: Response) {
    const settings = await notificationsService.updateSettings(req.body);
    res.status(200).json({ settings });
  },

  async markAllRead(req: Request, res: Response) {
    const result = await notificationsService.markAllRead(req.authUser!.id);
    res.status(200).json(result);
  },

  async markRead(req: Request, res: Response) {
    const result = await notificationsService.markRead(req.params.id, req.authUser!.id);
    res.status(200).json(result);
  },
};
