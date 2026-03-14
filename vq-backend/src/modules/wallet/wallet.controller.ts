import type { Request, Response } from "express";
import { walletService } from "./wallet.service.js";

export const walletController = {
  async getWallet(req: Request, res: Response) {
    const wallet = await walletService.getWallet(req.authUser!.id);
    res.status(200).json({ wallet });
  },

  async getTransactions(req: Request, res: Response) {
    const transactions = await walletService.getTransactions(
      req.authUser!.id,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.status(200).json({ transactions });
  },
};
