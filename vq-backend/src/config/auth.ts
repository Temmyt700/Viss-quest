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
    useSecureCookies: env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      secure: env.NODE_ENV === "production",
      path: "/",
    },
    backgroundTasks: {
      handler: (promise) => runNonBlocking("Better Auth background task", promise),
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: false,
    async sendVerificationEmail({ user, url }) {
      // Verification delivery is strict for signup/resend flows so users do not
      // see a success screen when no verification email was actually sent.
      await communicationsService.sendVerificationEmailStrict(
        { email: user.email, name: user.name },
        url,
      );
    },
    async afterEmailVerification(user) {
      void communicationsService.sendWelcomeAfterVerification(user.id);
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      await communicationsService.sendPasswordResetEmailStrict(
        { email: user.email, name: user.name, referenceId: (user as { referenceId?: string | null }).referenceId },
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
