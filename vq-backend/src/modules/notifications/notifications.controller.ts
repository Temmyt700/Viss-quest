import type { Request, Response } from "express";
import { notificationsService } from "./notifications.service.js";

export const notificationsController = {
  async list(req: Request, res: Response) {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const result = await notificationsService.list(req.authUser!.id, { limit, offset });
    res.status(200).json({
      notifications: result.items,
      total: result.total,
      unreadCount: result.unreadCount,
      hasMore: result.hasMore,
      nextOffset: result.nextOffset,
    });
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
