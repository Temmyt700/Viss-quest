import { BRAND_NAME, SUPPORT_EMAIL } from "./communications.constants.js";

type EmailTemplateInput = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  body: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  highlight?: {
    label: string;
    value: string;
    description?: string;
  };
  highlightFirst?: boolean;
  keyPoints?: Array<{
    title: string;
    text: string;
  }>;
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

const renderKeyPointsHtml = (points: EmailTemplateInput["keyPoints"]) => {
  if (!points?.length) return "";

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 18px;border-collapse:collapse;">
    ${points
      .map(
        (point) => `<tr>
      <td style="padding:0 0 10px;">
        <div style="border:1px solid #d6ebdc;background:#f4fbf6;border-radius:12px;padding:12px 14px;">
          <p style="margin:0 0 5px;color:#1e5a39;font-size:13px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;">${point.title}</p>
          <p style="margin:0;color:#2f4f3a;font-size:14px;line-height:1.65;">${point.text}</p>
        </div>
      </td>
    </tr>`,
      )
      .join("")}
  </table>`;
};

export const renderEmailTemplate = (input: EmailTemplateInput) => {
  const ctaBackgroundColor = input.ctaBackgroundColor || "#14532d";
  const ctaTextColor = input.ctaTextColor || "#ffffff";
  const highlightHtml = input.highlight
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 20px;border-collapse:separate;">
      <tr>
        <td style="border:1px solid #cce6d5;background:#f4fbf6;border-radius:14px;padding:14px 16px;">
          <p style="margin:0 0 6px;color:#2f5a43;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">${input.highlight.label}</p>
          <p style="margin:0;color:#153a25;font-size:22px;font-weight:800;line-height:1.3;word-break:break-word;">${input.highlight.value}</p>
          ${input.highlight.description ? `<p style="margin:8px 0 0;color:#466553;font-size:13px;line-height:1.55;">${input.highlight.description}</p>` : ""}
        </td>
      </tr>
    </table>`
    : "";
  const ctaHtml =
    input.ctaLabel && input.ctaUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0 0;">
      <tr>
        <td style="border-radius:999px;background:${ctaBackgroundColor};">
          <a href="${input.ctaUrl}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${ctaBackgroundColor};color:${ctaTextColor};font-size:15px;font-weight:700;text-decoration:none;mso-line-height-rule:exactly;">${input.ctaLabel}</a>
        </td>
      </tr>
    </table>`
      : "";
  const keyPointsHtml = renderKeyPointsHtml(input.keyPoints);
  const footerNote = input.footerNote || `If you need help, contact ${SUPPORT_EMAIL}.`;
  const highlightedContentHtml = input.highlightFirst
    ? `${highlightHtml}${keyPointsHtml}${renderBodyHtml(input.body)}`
    : `${renderBodyHtml(input.body)}${highlightHtml}${keyPointsHtml}`;
  const highlightText = input.highlight
    ? `${input.highlight.label}: ${input.highlight.value}\n${input.highlight.description ? `${input.highlight.description}\n` : ""}\n`
    : "";
  const keyPointsText = input.keyPoints?.length
    ? `${input.keyPoints.map((point) => `${point.title}: ${point.text}`).join("\n")}\n\n`
    : "";

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
                ${highlightedContentHtml}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <div style="border-top:1px solid #e8f3eb;padding-top:18px;color:#557465;font-size:13px;line-height:1.7;">
                  <p style="margin:0 0 8px;">${footerNote}</p>
                  <p style="margin:0;">VissQuest by VISS GLOBAL RESOURCES.</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: `${input.heading}\n\n${input.intro}\n\n${input.highlightFirst ? `${highlightText}${keyPointsText}${renderBodyText(input.body)}\n\n` : `${renderBodyText(input.body)}\n\n${highlightText}${keyPointsText}`}${input.ctaLabel && input.ctaUrl ? `${input.ctaLabel}: ${input.ctaUrl}\n\n` : ""}${footerNote}\n\nVissQuest by VISS GLOBAL RESOURCES.`,
  };
};
