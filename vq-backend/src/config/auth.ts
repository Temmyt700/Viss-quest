import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client.js";
import * as schema from "../db/schema/index.js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { getDatabaseConnectivityMessage, isDatabaseConnectivityError } from "../utils/databaseConnectivity.js";
import { getTrustedOrigins } from "../utils/origins.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: async (request) => getTrustedOrigins(request?.headers.get("origin")),
  emailAndPassword: {
    enabled: true,
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
