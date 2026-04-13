import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

type FundingAlertInput = {
  fullName: string;
  referenceId: string;
  amount: number;
  createdAt: Date | string;
};

const isTelegramConfigured = () =>
  Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);

const formatDateTime = (value: Date | string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const telegramService = {
  isConfigured() {
    return isTelegramConfigured();
  },

  async sendFundingAlert(input: FundingAlertInput) {
    if (!isTelegramConfigured()) {
      logger.warn("Telegram is not configured. Skipping funding alert.");
      return { skipped: true };
    }

    const message = [
      "🚨 New Funding Request",
      "",
      `User: ${input.fullName}`,
      `Reference ID: ${input.referenceId}`,
      `Amount: ₦${Number(input.amount || 0).toLocaleString("en-NG")}`,
      `Time: ${formatDateTime(input.createdAt)}`,
      "",
      "Action Required: Verify payment and approve in admin panel.",
    ].join("\n");

    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Telegram request failed with ${response.status}: ${body}`);
    }

    return { sent: true };
  },
};
