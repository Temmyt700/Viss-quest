import { eq } from "drizzle-orm";
import type { Response } from "express";
import { auth } from "../../config/auth.js";
import { db } from "../../db/client.js";
import { users, wallets } from "../../db/schema/index.js";
import { generateReferenceId } from "../../utils/referenceId.js";
import { isDatabaseConnectivityError } from "../../utils/databaseConnectivity.js";
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

export const authService = {
  async register(input: RegisterInput, res: Response) {
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
    } catch (error) {
      if (isDatabaseConnectivityError(error)) {
        throw new Error("Service is temporarily unavailable right now. Please try again in a moment.");
      }

      throw error;
    }

    applyReturnedHeaders(res, result.headers);

    const referenceId = await generateReferenceId();
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          phone: input.phone,
          referenceId,
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
        throw new Error("Service is temporarily unavailable right now. Please try again in a moment.");
      }

      if (error instanceof Error && /verify/i.test(error.message)) {
        throw new Error("Please verify your email before signing in.");
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
      if (isDatabaseConnectivityError(error)) {
        throw new Error("Service is temporarily unavailable right now. Please try again in a moment.");
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
        throw new Error("Service is temporarily unavailable right now. Please try again in a moment.");
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
      if (isDatabaseConnectivityError(error)) {
        throw new Error("Service is temporarily unavailable right now. Please try again in a moment.");
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
