import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { appRoutes } from "./modules/app/app.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { banksRoutes } from "./modules/banks/banks.routes.js";
import { drawsRoutes } from "./modules/draws/draws.routes.js";
import { fundingRoutes } from "./modules/funding/funding.routes.js";
import { notificationsRoutes } from "./modules/notifications/notifications.routes.js";
import { quizRoutes } from "./modules/quiz/quiz.routes.js";
import { spinRoutes } from "./modules/spin/spin.routes.js";
import { testimonialsRoutes } from "./modules/testimonials/testimonials.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { walletRoutes } from "./modules/wallet/wallet.routes.js";
import { winnersRoutes } from "./modules/winners/winners.routes.js";
import { isAllowedFrontendOrigin } from "./utils/origins.js";

export const createApp = () => {
  const app = express();
  // Render sits behind a reverse proxy in production. Trusting the proxy keeps
  // forwarded protocol/origin handling accurate for auth and secure requests.
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin(origin, callback) {
        callback(isAllowedFrontendOrigin(origin) ? null : new Error("Origin not allowed by CORS"), true);
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", (_req, res, next) => {
    // Dynamic API responses should always come from the network so the PWA
    // shell never serves stale draw, wallet, or dashboard data from cache.
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/app", appRoutes);
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
  app.use("/api/admin", adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
