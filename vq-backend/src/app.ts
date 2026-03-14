import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { banksRoutes } from "./modules/banks/banks.routes.js";
import { drawsRoutes } from "./modules/draws/draws.routes.js";
import { fundingRoutes } from "./modules/funding/funding.routes.js";
import { moderatorRoutes } from "./modules/moderator/moderator.routes.js";
import { notificationsRoutes } from "./modules/notifications/notifications.routes.js";
import { quizRoutes } from "./modules/quiz/quiz.routes.js";
import { spinRoutes } from "./modules/spin/spin.routes.js";
import { testimonialsRoutes } from "./modules/testimonials/testimonials.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { walletRoutes } from "./modules/wallet/wallet.routes.js";
import { winnersRoutes } from "./modules/winners/winners.routes.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/funding", fundingRoutes);
  app.use("/api/draws", drawsRoutes);
  app.use("/api/winners", winnersRoutes);
  app.use("/api/spin", spinRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/testimonials", testimonialsRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/banks", banksRoutes);
  app.use("/api/moderator", moderatorRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
