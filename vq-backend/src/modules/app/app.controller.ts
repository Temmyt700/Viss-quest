import type { Request, Response } from "express";
import { appService } from "./app.service.js";
import { retryOnDatabaseConnectivity } from "../../utils/retry.js";

export const appController = {
  async home(_req: Request, res: Response) {
    const payload = await retryOnDatabaseConnectivity(() => appService.getHome());
    res.status(200).json(payload);
  },

  async dashboard(req: Request, res: Response) {
    const payload = await retryOnDatabaseConnectivity(() => appService.getDashboard(req.authUser!.id));
    res.status(200).json(payload);
  },

  async dailyChances(req: Request, res: Response) {
    const payload = await retryOnDatabaseConnectivity(() => appService.getDailyChances(req.authUser!.id));
    res.status(200).json(payload);
  },

  async adminOverview(_req: Request, res: Response) {
    const payload = await retryOnDatabaseConnectivity(() => appService.getAdminOverview());
    res.status(200).json(payload);
  },
};
