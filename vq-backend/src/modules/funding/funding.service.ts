import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { fundingRequests, notifications, users, walletTransactions, wallets } from "../../db/schema/index.js";
import { toNumber } from "../../utils/money.js";
import { uploadBufferToCloudinary } from "../../utils/upload.js";

export const fundingService = {
  async create(userId: string, amount: number, proofFile?: Express.Multer.File) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new Error("User not found.");
    }

    const proof = proofFile
      ? await uploadBufferToCloudinary(proofFile.buffer, "vissquest/funding-proofs", proofFile.mimetype.startsWith("image/") ? "image" : "raw")
      : null;

    const [request] = await db
      .insert(fundingRequests)
      .values({
        userId,
        referenceId: user.referenceId ?? "PENDING_REF",
        amount: String(amount),
        proofUrl: proof?.secure_url,
        proofPublicId: proof?.public_id,
      })
      .returning();

    return request;
  },

  async listMine(userId: string) {
    return db.select().from(fundingRequests).where(eq(fundingRequests.userId, userId)).orderBy(desc(fundingRequests.createdAt));
  },

  async listPending() {
    return db
      .select()
      .from(fundingRequests)
      .where(eq(fundingRequests.status, "pending"))
      .orderBy(desc(fundingRequests.createdAt));
  },

  async approve(requestId: string, actorUserId: string) {
    return db.transaction(async (tx) => {
      const [request] = await tx
        .select()
        .from(fundingRequests)
        .where(and(eq(fundingRequests.id, requestId), eq(fundingRequests.status, "pending")))
        .limit(1);

      if (!request) {
        throw new Error("Funding request not found.");
      }

      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, request.userId)).limit(1);
      if (!wallet) {
        throw new Error("Wallet not found.");
      }

      const nextBalance = toNumber(wallet.balance) + toNumber(request.amount);

      await tx
        .update(wallets)
        .set({ balance: String(nextBalance), updatedAt: new Date() })
        .where(eq(wallets.id, wallet.id));

      await tx
        .update(fundingRequests)
        .set({ status: "approved", reviewedByUserId: actorUserId, reviewedAt: new Date() })
        .where(eq(fundingRequests.id, requestId));

      await tx.insert(walletTransactions).values({
        userId: request.userId,
        walletId: wallet.id,
        type: "deposit",
        amount: request.amount,
        status: "approved",
        reference: request.referenceId,
        description: "Manual wallet funding approval",
      });

      await tx.insert(notifications).values({
        userId: request.userId,
        title: "Wallet deposit approved",
        message: `Your funding request for NGN ${request.amount} has been approved.`,
        type: "funding",
      });

      return { success: true };
    });
  },

  async reject(requestId: string, actorUserId: string) {
    await db
      .update(fundingRequests)
      .set({ status: "rejected", reviewedByUserId: actorUserId, reviewedAt: new Date() })
      .where(eq(fundingRequests.id, requestId));

    return { success: true };
  },
};
