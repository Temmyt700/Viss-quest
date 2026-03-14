import type { Request, Response } from "express";
import { quizService } from "./quiz.service.js";

export const quizController = {
  async today(_req: Request, res: Response) {
    const quiz = await quizService.getToday();
    res.status(200).json({ quiz });
  },

  async answer(req: Request, res: Response) {
    const result = await quizService.answer(req.authUser!.id, req.body.quizId, req.body.selectedOption);
    res.status(200).json(result);
  },

  async history(req: Request, res: Response) {
    const attempts = await quizService.history(req.authUser!.id);
    res.status(200).json({ attempts });
  },

  async create(req: Request, res: Response) {
    const quiz = await quizService.create(req.body);
    res.status(201).json({ quiz });
  },
};
