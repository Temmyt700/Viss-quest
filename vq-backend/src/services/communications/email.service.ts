import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { renderEmailTemplate } from "./emailTemplates.js";

type EmailTemplateName =
  | "verification"
  | "password_reset"
  | "funding_approved"
  | "funding_rejected"
  | "draw_entry_confirmed"
  | "winner_notification"
  | "referral_reward";

type EmailRecipient = {
  email: string;
  name?: string | null;
};

type EmailTemplatePayload =
  | {
      type: "verification";
      verifyUrl: string;
    }
  | {
      type: "password_reset";
      resetUrl: string;
    }
  | {
      type: "funding_approved";
      amount: number;
    }
  | {
      type: "funding_rejected";
      amount: number;
    }
  | {
      type: "draw_entry_confirmed";
      drawTitle: string;
      entryFee: number;
    }
  | {
      type: "winner_notification";
      prizeTitle: string;
      referenceId: string;
    }
  | {
      type: "referral_reward";
      amount: number;
    };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const isEmailConfigured = () =>
  Boolean(
    env.ZEPTO_MAIL_API_KEY && env.ZEPTO_MAIL_FROM_EMAIL && env.ZEPTO_MAIL_FROM_NAME,
  );

const buildTemplate = (recipient: EmailRecipient, payload: EmailTemplatePayload) => {
  const name = recipient.name?.trim() || "there";

  switch (payload.type) {
    case "verification":
      return renderEmailTemplate({
        subject: "Verify your VissQuest email",
        preheader: "Confirm your email address to activate your VissQuest account.",
        heading: "Verify your email",
        intro: `Hi ${name}, welcome to VissQuest.`,
        body: [
          "Please verify your email address before signing in to your account.",
          "Once verified, you can fund your wallet, enter draws, and receive account updates smoothly.",
        ],
        ctaLabel: "Verify Email",
        ctaUrl: payload.verifyUrl,
      });
    case "password_reset":
      return renderEmailTemplate({
        subject: "Reset your VissQuest password",
        preheader: "Use this secure link to set a new password for your account.",
        heading: "Reset your password",
        intro: `Hi ${name}, we received a request to reset your password.`,
        body: [
          "Use the button below to choose a new password.",
          "If you did not request this, you can safely ignore this email.",
        ],
        ctaLabel: "Reset Password",
        ctaUrl: payload.resetUrl,
      });
    case "funding_approved":
      return renderEmailTemplate({
        subject: "Your Wallet Has Been Funded",
        preheader: "Your payment has been confirmed and your wallet is now credited.",
        heading: "Wallet funded successfully",
        intro: `Hi ${name}, your payment has been confirmed.`,
        body: [
          `Your wallet has been credited with ${formatCurrency(payload.amount)}.`,
          "You can now use your balance to enter draws and participate in activities on VissQuest.",
        ],
      });
    case "funding_rejected":
      return renderEmailTemplate({
        subject: "Payment Not Confirmed",
        preheader: "We could not verify your wallet funding request.",
        heading: "Payment not confirmed",
        intro: `Hi ${name}, we could not verify your payment.`,
        body: [
          `Your funding request for ${formatCurrency(payload.amount)} could not be confirmed.`,
          "Please contact support or try again with the correct transfer details.",
        ],
      });
    case "draw_entry_confirmed":
      return renderEmailTemplate({
        subject: "Draw Entry Confirmed",
        preheader: "Your VissQuest draw entry has been recorded successfully.",
        heading: "Draw entry confirmed",
        intro: `Hi ${name}, your entry is in.`,
        body: [
          `You have successfully entered ${payload.drawTitle}.`,
          `Entry fee charged: ${formatCurrency(payload.entryFee)}.`,
          "Best of luck. We hope luck swings your way.",
        ],
      });
    case "winner_notification":
      return renderEmailTemplate({
        subject: "Congratulations! You Won 🎉",
        preheader: "You have been selected as a VissQuest winner.",
        heading: "Congratulations, you won",
        intro: `Hi ${name}, your reference ID ${payload.referenceId} has been selected as a winner.`,
        body: [
          `Prize won: ${payload.prizeTitle}.`,
          "Please check your dashboard for the latest details and next steps.",
        ],
      });
    case "referral_reward":
      return renderEmailTemplate({
        subject: "You Earned a Referral Reward",
        preheader: "Your referral reward has been added to your wallet.",
        heading: "Referral reward credited",
        intro: `Hi ${name}, good news.`,
        body: [
          `You have received ${formatCurrency(payload.amount)} as a referral bonus.`,
          "Thank you for helping more people discover VissQuest.",
        ],
      });
  }
};

export const emailService = {
  isConfigured() {
    return isEmailConfigured();
  },

  async sendTemplate(recipient: EmailRecipient, payload: EmailTemplatePayload) {
    if (!isEmailConfigured()) {
      logger.warn("ZeptoMail is not configured. Skipping email send.", {
        to: recipient.email,
        template: payload.type,
      });
      return { skipped: true };
    }

    const template = buildTemplate(recipient, payload);
    const response = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${env.ZEPTO_MAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          address: env.ZEPTO_MAIL_FROM_EMAIL,
          name: env.ZEPTO_MAIL_FROM_NAME,
        },
        to: [
          {
            email_address: {
              address: recipient.email,
              name: recipient.name || undefined,
            },
          },
        ],
        subject: template.subject,
        htmlbody: template.html,
        textbody: template.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`ZeptoMail request failed with ${response.status}: ${body}`);
    }

    return { sent: true };
  },
};
