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

  async participants(_req: Request, res: Response) {
    const participants = await adminService.listParticipants();
    res.status(200).json({ participants });
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

  async referralInsights(_req: Request, res: Response) {
    const insights = await adminService.getReferralInsights();
    res.status(200).json(insights);
  },

  async referralSettings(_req: Request, res: Response) {
    const settings = await adminService.getReferralSettings();
    res.status(200).json({ settings });
  },

  async updateReferralSettings(req: Request, res: Response) {
    const settings = await adminService.updateReferralSettings(req.body, req.authUser!.id);
    res.status(200).json({ settings });
  },

  async pendingDrawWinners(_req: Request, res: Response) {
    const pending = await adminService.getPendingDrawWinners();
    res.status(200).json({ pending });
  },

  async announcePendingWinner(req: Request, res: Response) {
    const result = await adminService.announcePendingWinner(req.params.id, req.authUser!.id);
    res.status(200).json(result);
  },

  async rerunPendingWinner(req: Request, res: Response) {
    const result = await adminService.rerunPendingWinner(req.params.id, req.authUser!.id);
    res.status(200).json(result);
  },
};
