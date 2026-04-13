import type { Request, Response } from "express";
import { authService } from "./auth.service.js";

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body, res);
    res.status(201).json({ user });
  },

  async login(req: Request, res: Response) {
    const session = await authService.login(req.body, res);
    res.status(200).json(session);
  },

  async forgotPassword(req: Request, res: Response) {
    const result = await authService.requestPasswordReset(req.body);
    res.status(200).json(result);
  },

  async resetPassword(req: Request, res: Response) {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(result);
  },

  async resendVerification(req: Request, res: Response) {
    const result = await authService.resendVerification(req.body);
    res.status(200).json(result);
  },

  async logout(req: Request, res: Response) {
    const result = await authService.logout(res, req.headers as HeadersInit);
    res.status(200).json(result);
  },

  async profile(req: Request, res: Response) {
    res.status(200).json({ user: req.authUser });
  },
};
