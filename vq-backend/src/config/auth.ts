import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client.js";
import * as schema from "../db/schema/index.js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { getDatabaseConnectivityMessage, isDatabaseConnectivityError } from "../utils/databaseConnectivity.js";
import { getTrustedOrigins } from "../utils/origins.js";
import { communicationsService } from "../services/communications/communications.service.js";
import { runNonBlocking } from "../utils/backgroundTask.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: async (request) => getTrustedOrigins(request?.headers.get("origin")),
  advanced: {
    backgroundTasks: {
      handler: (promise) => runNonBlocking("Better Auth background task", promise),
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    async sendVerificationEmail({ user, url }) {
      communicationsService.sendVerificationEmail(
        { email: user.email, name: user.name },
        url,
      );
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      communicationsService.sendPasswordResetEmail(
        { email: user.email, name: user.name },
        url,
      );
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  // Better Auth logs internal adapter errors directly. We intercept them here
  // so temporary DB outages do not flood the terminal with large stack traces.
  logger: {
    level: "error",
    log(level, message, ...args) {
      const connectivityIssue = args.find((item) => isDatabaseConnectivityError(item));
      if (connectivityIssue) {
        logger.warn(`Better Auth could not reach the database. ${getDatabaseConnectivityMessage(connectivityIssue)}`);
        return;
      }

      if (level === "error") {
        logger.error(`Better Auth: ${message}`, args.length > 0 ? args : undefined);
        return;
      }

      logger.info(`Better Auth: ${message}`, args.length > 0 ? args : undefined);
    },
  },
  onAPIError: {
    onError(error) {
      if (isDatabaseConnectivityError(error)) {
        logger.warn(`Better Auth request failed because the database is unreachable. ${getDatabaseConnectivityMessage(error)}`);
      }
    },
  },
});
