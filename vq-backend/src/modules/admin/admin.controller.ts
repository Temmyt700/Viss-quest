import type { Request, Response } from "express";
import { adminService } from "./admin.service.js";

export const adminController = {
  async overview(_req: Request, res: Response) {
    const overview = await adminService.getOverview();
    res.status(200).json(overview);
  },

  async listUsers(_req: Request, res: Response) {
    const users = await adminService.listUsers();
    res.status(200).json({ users });
  },

  async getUser(req: Request, res: Response) {
    const user = await adminService.getUser(req.params.id);
    res.status(200).json(user);
  },

  async updateUserStatus(req: Request, res: Response) {
    const result = await adminService.updateUserStatus(req.params.id, req.body.status, req.authUser!.id);
    res.status(200).json(result);
  },

  async updateUserRole(req: Request, res: Response) {
    const result = await adminService.updateUserRole(req.params.id, req.body.role, req.authUser!.id);
    res.status(200).json(result);
  },

  async adjustWallet(req: Request, res: Response) {
    const result = await adminService.adjustWallet(req.body, req.authUser!.id);
    res.status(200).json(result);
  },

  async walletStats(_req: Request, res: Response) {
    const stats = await adminService.getWalletStats();
    res.status(200).json(stats);
  },
};
