import { eq } from "drizzle-orm";
import type { Response } from "express";
import { auth } from "../../config/auth.js";
import { db } from "../../db/client.js";
import { users, wallets } from "../../db/schema/index.js";
import { generateReferenceId } from "../../utils/referenceId.js";
import { referralsService } from "../referrals/referrals.service.js";

type RegisterInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
};

type LoginInput = {
  email: string;
  password: string;
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
    const result = await auth.api.signUpEmail({
      body: {
        name: input.fullName,
        email: input.email,
        password: input.password,
      },
      returnHeaders: true,
    });

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
    const result = await auth.api.signInEmail({
      body: input,
      returnHeaders: true,
    });

    applyReturnedHeaders(res, result.headers);
    return result.response;
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
