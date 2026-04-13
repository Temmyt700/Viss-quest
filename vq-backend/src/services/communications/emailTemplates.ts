import { BRAND_NAME, SUPPORT_EMAIL } from "./communications.constants.js";

type EmailTemplateInput = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  body: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
};

const renderBodyHtml = (lines: string[]) =>
  lines
    .map(
      (line) =>
        `<p style="margin:0 0 14px;color:#35523b;font-size:15px;line-height:1.7;">${line}</p>`,
    )
    .join("");

const renderBodyText = (lines: string[]) => lines.join("\n\n");

export const renderEmailTemplate = (input: EmailTemplateInput) => {
  const ctaHtml =
    input.ctaLabel && input.ctaUrl
      ? `<p style="margin:24px 0 0;"><a href="${input.ctaUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:linear-gradient(135deg,#22c55e,#14b8a6);color:#ffffff;font-weight:700;text-decoration:none;">${input.ctaLabel}</a></p>`
      : "";
  const footerNote = input.footerNote || `If you need help, contact ${SUPPORT_EMAIL}.`;

  return {
    subject: input.subject,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${input.subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4fbf6;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${input.preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4fbf6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #dfeee4;box-shadow:0 18px 50px rgba(34,120,74,0.08);">
            <tr>
              <td style="padding:28px 28px 18px;background:radial-gradient(circle at top left,#dcfce7 0%,#f8fffb 55%,#effcf6 100%);border-bottom:1px solid #e6f4eb;">
                <p style="margin:0 0 8px;color:#0f5132;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">${BRAND_NAME}</p>
                <h1 style="margin:0;color:#153a25;font-size:28px;line-height:1.2;">${input.heading}</h1>
                <p style="margin:14px 0 0;color:#476455;font-size:15px;line-height:1.7;">${input.intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${renderBodyHtml(input.body)}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <div style="border-top:1px solid #e8f3eb;padding-top:18px;color:#557465;font-size:13px;line-height:1.7;">
                  <p style="margin:0 0 8px;">${footerNote}</p>
                  <p style="margin:0;">This email was sent by ${BRAND_NAME}, operated under VISS GLOBAL RESOURCES.</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: `${input.heading}\n\n${input.intro}\n\n${renderBodyText(input.body)}\n\n${input.ctaLabel && input.ctaUrl ? `${input.ctaLabel}: ${input.ctaUrl}\n\n` : ""}${footerNote}\n\nThis email was sent by ${BRAND_NAME}, operated under VISS GLOBAL RESOURCES.`,
  };
};
