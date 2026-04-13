import { eq, inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users } from "../../db/schema/index.js";
import { logger } from "../../config/logger.js";
import { runNonBlocking } from "../../utils/backgroundTask.js";
import { emailService } from "./email.service.js";
import { telegramService } from "./telegram.service.js";

const findUserById = async (userId: string) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      referenceId: users.referenceId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
};

export const communicationsService = {
  notifyFundingRequestAdmin(payload: {
    fullName: string;
    referenceId: string;
    amount: number;
    createdAt: Date | string;
  }) {
    runNonBlocking("Telegram funding alert", telegramService.sendFundingAlert(payload));
  },

  sendVerificationEmail(user: { email: string; name?: string | null }, verifyUrl: string) {
    runNonBlocking(
      "Verification email",
      emailService.sendTemplate(
        { email: user.email, name: user.name },
        { type: "verification", verifyUrl },
      ),
    );
  },

  sendPasswordResetEmail(user: { email: string; name?: string | null }, resetUrl: string) {
    runNonBlocking(
      "Password reset email",
      emailService.sendTemplate(
        { email: user.email, name: user.name },
        { type: "password_reset", resetUrl },
      ),
    );
  },

  async sendFundingApprovedEmail(userId: string, amount: number) {
    const user = await findUserById(userId);
    if (!user?.email) {
      logger.warn("Could not send funding approved email because the user email is missing.", { userId });
      return;
    }

    runNonBlocking(
      "Funding approved email",
      emailService.sendTemplate(
        { email: user.email, name: user.name },
        { type: "funding_approved", amount },
      ),
    );
  },

  async sendFundingRejectedEmail(userId: string, amount: number) {
    const user = await findUserById(userId);
    if (!user?.email) {
      logger.warn("Could not send funding rejected email because the user email is missing.", { userId });
      return;
    }

    runNonBlocking(
      "Funding rejected email",
      emailService.sendTemplate(
        { email: user.email, name: user.name },
        { type: "funding_rejected", amount },
      ),
    );
  },

  async sendDrawEntryConfirmationEmail(userId: string, drawTitle: string, entryFee: number) {
    const user = await findUserById(userId);
    if (!user?.email) {
      logger.warn("Could not send draw entry email because the user email is missing.", { userId });
      return;
    }

    runNonBlocking(
      "Draw entry confirmation email",
      emailService.sendTemplate(
        { email: user.email, name: user.name },
        { type: "draw_entry_confirmed", drawTitle, entryFee },
      ),
    );
  },

  async sendWinnerEmails(winnerRows: Array<{ userId: string; prizeTitle: string; referenceId: string }>) {
    const uniqueUserIds = [...new Set(winnerRows.map((winner) => winner.userId))];
    if (!uniqueUserIds.length) {
      return;
    }

    const userRows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(inArray(users.id, uniqueUserIds));
    const usersById = new Map(userRows.map((user) => [user.id, user]));

    for (const winner of winnerRows) {
      const user = usersById.get(winner.userId);
      if (!user?.email) continue;

      runNonBlocking(
        `Winner email (${winner.userId})`,
        emailService.sendTemplate(
          { email: user.email, name: user.name },
          {
            type: "winner_notification",
            prizeTitle: winner.prizeTitle,
            referenceId: winner.referenceId,
          },
        ),
      );
    }
  },

  async sendReferralRewardEmail(userId: string, amount: number) {
    const user = await findUserById(userId);
    if (!user?.email) {
      logger.warn("Could not send referral reward email because the user email is missing.", { userId });
      return;
    }

    runNonBlocking(
      "Referral reward email",
      emailService.sendTemplate(
        { email: user.email, name: user.name },
        { type: "referral_reward", amount },
      ),
    );
  },
};
