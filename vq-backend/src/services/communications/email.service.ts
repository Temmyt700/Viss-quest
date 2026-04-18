import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { renderEmailTemplate } from "./emailTemplates.js";

const MAX_SEND_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1500, 4000];
const EMAIL_REQUEST_TIMEOUT_MS = 15000;
const PARTY = "\u{1F389}";

type EmailRecipient = {
  email: string;
  name?: string | null;
  referenceId?: string | null;
};

type SendTemplateOptions = {
  requiredDelivery?: boolean;
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
    }
  | {
      type: "welcome_verified";
      referenceId: string;
      dashboardUrl: string;
    };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const normalizeReferenceId = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized && normalized !== "PENDING_REF" ? normalized : null;
};

const getRecipientIdentity = (recipient: EmailRecipient) => {
  const displayName = recipient.name?.trim() || "VissQuest member";
  const referenceId = normalizeReferenceId(recipient.referenceId);

  if (!referenceId) {
    return {
      displayName,
      referenceId: null as string | null,
      identityLabel: displayName,
    };
  }

  return {
    displayName,
    referenceId,
    identityLabel: `${displayName} (${referenceId})`,
  };
};

const isEmailConfigured = () =>
  Boolean(
    env.ZEPTO_MAIL_API_KEY && env.ZEPTO_MAIL_FROM_EMAIL && env.ZEPTO_MAIL_FROM_NAME,
  );

const normalizeZeptoMailToken = (value: string) =>
  value
    .trim()
    // Accept either the raw send-mail token or a copied Authorization value.
    .replace(/^Authorization:\s*/i, "")
    .replace(/^Zoho-enczapikey\s+/i, "")
    .trim();

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isRetryableNetworkError = (error: unknown) => {
  const code = (error as { cause?: { code?: string }; code?: string })?.cause?.code
    || (error as { cause?: { code?: string }; code?: string })?.code;

  return [
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_SOCKET",
    "ETIMEDOUT",
    "ECONNRESET",
    "EAI_AGAIN",
    "ENOTFOUND",
  ].includes(String(code));
};

const createEmailDeliveryError = (
  message: string,
  code: string,
  cause?: unknown,
) => {
  const error = new Error(message) as Error & {
    code: string;
    statusCode: number;
    cause?: unknown;
  };
  error.code = code;
  error.statusCode = 503;
  if (cause) {
    error.cause = cause;
  }
  return error;
};

const buildZeptoMailError = async (response: Response) => {
  const rawBody = await response.text().catch(() => "");

  try {
    const payload = rawBody ? JSON.parse(rawBody) : null;
    const detailCode = payload?.error?.details?.[0]?.code;
    if (response.status === 401 && detailCode === "SERR_157") {
      return "ZeptoMail rejected the token. Use the Mail Agent send-mail token only, without the 'Zoho-enczapikey' prefix.";
    }
  } catch {
    // Fall through to the raw upstream message when the body is not JSON.
  }

  return `ZeptoMail request failed with ${response.status}: ${rawBody}`;
};

const buildTemplate = (recipient: EmailRecipient, payload: EmailTemplatePayload) => {
  const { displayName, referenceId, identityLabel } = getRecipientIdentity(recipient);

  switch (payload.type) {
    case "verification":
      return renderEmailTemplate({
        subject: "Verify your VissQuest email",
        preheader: "Confirm your email address to activate your VissQuest account.",
        heading: "Verify your email",
        intro: `Hi ${displayName}, welcome to VissQuest.`,
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
        intro: `Hi ${identityLabel}, we received a request to reset your password.`,
        body: [
          "Use the button below to choose a new password.",
          "If you did not request this, you can safely ignore this email.",
        ],
        highlight: referenceId
          ? {
              label: "Your VissQuest ID",
              value: referenceId,
              description: "Keep this ID for account verification and secure support follow-up.",
            }
          : undefined,
        ctaLabel: "Reset Password",
        ctaUrl: payload.resetUrl,
      });
    case "funding_approved":
      return renderEmailTemplate({
        subject: "Your Wallet Has Been Funded",
        preheader: "Your payment has been confirmed and your wallet is now credited.",
        heading: "Wallet funded successfully",
        intro: `Hi ${identityLabel}, your payment has been confirmed.`,
        highlightFirst: true,
        highlight: referenceId
          ? {
              label: "Your VissQuest ID",
              value: referenceId,
              description: "Use this ID for draw participation, payment verification, and winner announcements.",
            }
          : undefined,
        keyPoints: [
          {
            title: "Funding Confirmed",
            text: `Your wallet has been credited with ${formatCurrency(payload.amount)}.`,
          },
          {
            title: "Ready to Participate",
            text: "You can now use your balance to enter draws, spin, and join daily opportunities.",
          },
        ],
        body: [
          "Thank you for funding early. Your account is now ready for the next draw cycle.",
        ],
      });
    case "funding_rejected":
      return renderEmailTemplate({
        subject: "Payment Not Confirmed",
        preheader: "We could not verify your wallet funding request.",
        heading: "Payment not confirmed",
        intro: `Hi ${identityLabel}, we could not verify your payment.`,
        highlight: referenceId
          ? {
              label: "Your VissQuest ID",
              value: referenceId,
              description: "Keep this ID handy when contacting support about your payment request.",
            }
          : undefined,
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
        intro: `Hi ${identityLabel}, your entry is in.`,
        highlight: referenceId
          ? {
              label: "Your VissQuest ID",
              value: referenceId,
              description: "This ID keeps your draw participation and winner announcements private and trackable.",
            }
          : undefined,
        body: [
          `You have successfully entered ${payload.drawTitle}.`,
          `Entry fee charged: ${formatCurrency(payload.entryFee)}.`,
          "Best of luck. We hope luck swings your way.",
        ],
      });
    case "winner_notification":
      return renderEmailTemplate({
        subject: `Congratulations! You Won ${PARTY}`,
        preheader: "You have been selected as a VissQuest winner.",
        heading: "Congratulations, you won",
        intro: `Hi ${identityLabel}, your account has been selected as a winner.`,
        highlightFirst: true,
        highlight: {
          label: "Winning VissQuest ID",
          value: referenceId ?? payload.referenceId,
          description: "Your private winner reference is now confirmed in our system.",
        },
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
        intro: `Hi ${identityLabel}, good news.`,
        highlight: referenceId
          ? {
              label: "Your VissQuest ID",
              value: referenceId,
              description: "Referral rewards are tied to your VissQuest ID for secure activity tracking.",
            }
          : undefined,
        body: [
          `You have received ${formatCurrency(payload.amount)} as a referral bonus.`,
          "Thank you for helping more people discover VissQuest.",
        ],
      });
    case "welcome_verified":
      return renderEmailTemplate({
        subject: `Welcome to VissQuest ${PARTY} Your Account is Ready`,
        preheader: "Your VissQuest account is verified and ready to use.",
        heading: `Welcome to VissQuest ${PARTY}`,
        intro: `Hi ${identityLabel}, your account has been successfully verified and you are now ready to participate.`,
        highlightFirst: true,
        highlight: {
          label: "Your VissQuest ID",
          value: referenceId ?? payload.referenceId,
          description: "This is your official identity on VissQuest and it is used for draw entries, tracking participation, payment verification, and private winner announcements.",
        },
        keyPoints: [
          {
            title: "How it works",
            text: "Step 1: Fund your wallet. Step 2: Enter draws or spin. Step 3: Wait for draw day. Step 4: Winners are selected automatically.",
          },
          {
            title: "Trusted payments",
            text: "All payments are made to VISS GLOBAL RESOURCES, the parent brand behind VissQuest.",
          },
          {
            title: "Important tip",
            text: "Fund your wallet early before draw days so manual verification can be completed on time.",
          },
          {
            title: "More chances",
            text: `You get extra opportunities through daily spin, free-entry rewards, and multiple chances to win ${PARTY}`,
          },
        ],
        body: [
          "Invite friends when you are ready and earn referral rewards directly into your wallet.",
        ],
        ctaLabel: "Go to Dashboard",
        ctaUrl: payload.dashboardUrl,
        ctaBackgroundColor: "#10210f",
        ctaTextColor: "#ffffff",
      });
  }
};

export const emailService = {
  isConfigured() {
    return isEmailConfigured();
  },

  async sendTemplate(
    recipient: EmailRecipient,
    payload: EmailTemplatePayload,
    options: SendTemplateOptions = {},
  ) {
    const { requiredDelivery = false } = options;

    if (!isEmailConfigured()) {
      if (requiredDelivery) {
        throw createEmailDeliveryError(
          "We could not send email right now. Please retry.",
          "EMAIL_PROVIDER_NOT_CONFIGURED",
        );
      }

      logger.warn("ZeptoMail is not configured. Skipping email send.", {
        to: recipient.email,
        template: payload.type,
      });
      return { skipped: true };
    }

    const template = buildTemplate(recipient, payload);
    const apiToken = normalizeZeptoMailToken(env.ZEPTO_MAIL_API_KEY);

    for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch("https://api.zeptomail.com/v1.1/email", {
          method: "POST",
          signal: AbortSignal.timeout(EMAIL_REQUEST_TIMEOUT_MS),
          headers: {
            Authorization: `Zoho-enczapikey ${apiToken}`,
            Accept: "application/json",
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
          const error = new Error(await buildZeptoMailError(response)) as Error & { retryable?: boolean };
          error.retryable = response.status >= 500 || response.status === 429;
          throw error;
        }

        return { sent: true };
      } catch (error) {
        const retryable = (error as { retryable?: boolean })?.retryable || isRetryableNetworkError(error);
        const canRetry = retryable && attempt < MAX_SEND_ATTEMPTS;

        if (!canRetry) {
          if (error instanceof Error && /401/.test(error.message)) {
            throw createEmailDeliveryError(
              "We could not send email right now. Please retry.",
              "EMAIL_PROVIDER_AUTH_FAILED",
              error,
            );
          }

          if (isRetryableNetworkError(error)) {
            throw createEmailDeliveryError(
              "We could not send email right now. Please retry.",
              "EMAIL_PROVIDER_TIMEOUT",
              error,
            );
          }

          throw createEmailDeliveryError(
            "We could not send email right now. Please retry.",
            "EMAIL_DELIVERY_FAILED",
            error,
          );
        }

        logger.warn("ZeptoMail send attempt failed; retrying.", {
          to: recipient.email,
          template: payload.type,
          attempt,
        });
        await wait(RETRY_DELAYS_MS[attempt - 1] ?? 5000);
      }
    }
  },
};

