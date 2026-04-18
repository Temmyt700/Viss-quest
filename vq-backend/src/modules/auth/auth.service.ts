import { eq } from "drizzle-orm";
import type { Response } from "express";
import { auth } from "../../config/auth.js";
import { logger } from "../../config/logger.js";
import { db } from "../../db/client.js";
import { users, wallets } from "../../db/schema/index.js";
import { generateReferenceId } from "../../utils/referenceId.js";
import { isDatabaseConnectivityError } from "../../utils/databaseConnectivity.js";
import { isServiceUnavailableFailure, ServiceUnavailableError } from "../../utils/serviceAvailability.js";
import { referralsService } from "../referrals/referrals.service.js";

type RegisterInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
  callbackURL?: string;
};

type LoginInput = {
  email: string;
  password: string;
  callbackURL?: string;
};

type ForgotPasswordInput = {
  email: string;
  redirectTo: string;
};

type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

type ResendVerificationInput = {
  email: string;
  callbackURL: string;
};

const applyReturnedHeaders = (res: Response, headers?: Headers) => {
  if (!headers) return;
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      res.append("set-cookie", value);
      return;
    }

    res.setHeader(key, value);
  });
};

const cleanupUserById = async (userId?: string | null) => {
  if (!userId) return;

  try {
    await db.delete(users).where(eq(users.id, userId));
  } catch (error) {
    logger.warn("Could not clean up partially created signup user.", { userId, error });
  }
};

const cleanupRecentUnverifiedUserByEmail = async (email: string, startedAt: Date) => {
  try {
    const [candidate] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!candidate) return;

    const createdAt = candidate.createdAt ? new Date(candidate.createdAt) : null;
    const isRecent = createdAt ? createdAt.getTime() >= startedAt.getTime() : false;
    if (isRecent && !candidate.emailVerified) {
      await db.delete(users).where(eq(users.id, candidate.id));
    }
  } catch (error) {
    logger.warn("Could not clean up recent failed signup record.", { email, error });
  }
};

export const authService = {
  async register(input: RegisterInput, res: Response) {
    const signupStartedAt = new Date();
    let createdUserId: string | null = null;
    let result;
    try {
      result = await auth.api.signUpEmail({
        body: {
          name: input.fullName,
          email: input.email,
          password: input.password,
          callbackURL: input.callbackURL,
        },
        returnHeaders: true,
      });
      createdUserId = result.response.user.id;
    } catch (error) {
      if (isServiceUnavailableFailure(error)) {
        await cleanupRecentUnverifiedUserByEmail(input.email, signupStartedAt);
        throw new ServiceUnavailableError("We could not send the verification email right now. Please retry.");
      }

      if (isDatabaseConnectivityError(error)) {
        throw new ServiceUnavailableError("Service is temporarily unavailable right now. Please try again in a moment.");
      }

      throw error;
    }

    applyReturnedHeaders(res, result.headers);

    try {
      const referenceId = await generateReferenceId();
      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({
            phone: input.phone,
            referenceId,
            // New accounts remain unverified until they complete the email link flow.
            emailVerified: false,
          })
          .where(eq(users.id, result.response.user.id));

        await tx.insert(wallets).values({
          userId: result.response.user.id,
          balance: "0",
        });
      });

      // Attach the referral after the new user exists and has a stable reference id.
      await referralsService.attachReferral(result.response.user.id, input.referralCode);

      const [user] = await db.select().from(users).where(eq(users.id, result.response.user.id)).limit(1);
      return user;
    } catch (error) {
      await cleanupUserById(createdUserId);

      if (isServiceUnavailableFailure(error) || isDatabaseConnectivityError(error)) {
        throw new ServiceUnavailableError("Service is temporarily unavailable right now. Please try again in a moment.");
      }

      throw error;
    }
  },

  async login(input: LoginInput, res: Response) {
    let result;
    try {
      result = await auth.api.signInEmail({
        body: input,
        returnHeaders: true,
      });
    } catch (error) {
      if (isDatabaseConnectivityError(error)) {
        throw new ServiceUnavailableError("Service is temporarily unavailable right now. Please try again in a moment.");
      }

      throw error;
    }

    applyReturnedHeaders(res, result.headers);
    return result.response;
  },

  async requestPasswordReset(input: ForgotPasswordInput) {
    try {
      await auth.api.requestPasswordReset({
        body: {
          email: input.email,
          redirectTo: input.redirectTo,
        },
      });
    } catch (error) {
      if (isServiceUnavailableFailure(error) || isDatabaseConnectivityError(error)) {
        throw new ServiceUnavailableError("We could not send the reset email right now. Please retry.");
      }

      throw error;
    }

    return { success: true };
  },

  async resetPassword(input: ResetPasswordInput) {
    try {
      await auth.api.resetPassword({
        body: {
          token: input.token,
          newPassword: input.newPassword,
        },
      });
    } catch (error) {
      if (isDatabaseConnectivityError(error)) {
        throw new ServiceUnavailableError("Service is temporarily unavailable right now. Please try again in a moment.");
      }

      throw error;
    }

    return { success: true };
  },

  async resendVerification(input: ResendVerificationInput) {
    try {
      await auth.api.sendVerificationEmail({
        body: {
          email: input.email,
          callbackURL: input.callbackURL,
        },
      });
    } catch (error) {
      if (isServiceUnavailableFailure(error) || isDatabaseConnectivityError(error)) {
        throw new ServiceUnavailableError("We could not send the verification email right now. Please retry.");
      }

      throw error;
    }

    return { success: true };
  },

  async logout(res: Response, headers: HeadersInit) {
    const result = await auth.api.signOut({
      headers,
      returnHeaders: true,
    });

    applyReturnedHeaders(res, result.headers);
    return { success: true };
  },
};
