import type { Request, Response } from "express";
import { usersService } from "./users.service.js";

export const usersController = {
  async me(req: Request, res: Response) {
    const user = await usersService.getMe(req.authUser!.id);
    res.status(200).json({ user });
  },

  async updateMe(req: Request, res: Response) {
    const user = await usersService.updateMe(req.authUser!.id, req.body);
    res.status(200).json({ user });
  },

  async dashboard(req: Request, res: Response) {
    const dashboard = await usersService.getDashboard(req.authUser!.id);
    res.status(200).json(dashboard);
  },

  async notifications(req: Request, res: Response) {
    const result = await usersService.getNotifications(req.authUser!.id);
    res.status(200).json({
      notifications: result.items,
      total: result.total,
      unreadCount: result.unreadCount,
      hasMore: result.hasMore,
      nextOffset: result.nextOffset,
    });
  },
};
