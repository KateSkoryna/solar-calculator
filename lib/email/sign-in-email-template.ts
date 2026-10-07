const EMAIL_COLORS = {
  ground: "#F6F4EE",
  surface: "#FFFFFF",
  ink: "#16231B",
  muted: "#4F5F55",
  line: "#DEE3DA",
  lime: "#B6F065",
  forest: "#1F3A2B",
} as const;

const EMAIL_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const BRAND_NAME = "SunFleet";

export interface SignInEmailTemplateContent {
  locale: string;
  intro: string;
  buttonLabel: string;
  fallbackHint: string;
  expiry: string;
  ignoreNotice: string;
  signInUrl: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderSignInEmailHtml(
  content: SignInEmailTemplateContent,
): string {
  const safeUrl = escapeHtml(content.signInUrl);

  return `<!DOCTYPE html>
<html lang="${content.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.ground};font-family:${EMAIL_FONT_STACK};color:${EMAIL_COLORS.ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${EMAIL_COLORS.ground};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="padding:0 0 16px 0;font-size:18px;font-weight:700;color:${EMAIL_COLORS.forest};">
<span style="display:inline-block;width:12px;height:12px;border-radius:6px;background-color:${EMAIL_COLORS.lime};margin-right:8px;"></span>${BRAND_NAME}
</td></tr>
<tr><td style="background-color:${EMAIL_COLORS.surface};border:1px solid ${EMAIL_COLORS.line};border-radius:16px;padding:32px;">
<p style="margin:0 0 24px 0;font-size:16px;line-height:24px;color:${EMAIL_COLORS.ink};">${content.intro}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
<tr><td style="background-color:${EMAIL_COLORS.lime};border-radius:999px;">
<a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:${EMAIL_COLORS.ink};text-decoration:none;">${content.buttonLabel}</a>
</td></tr>
</table>
<p style="margin:0 0 8px 0;font-size:14px;line-height:20px;color:${EMAIL_COLORS.muted};">${content.expiry}</p>
<p style="margin:0;font-size:14px;line-height:20px;color:${EMAIL_COLORS.muted};">${content.ignoreNotice}</p>
</td></tr>
<tr><td style="padding:16px 8px 0 8px;font-size:12px;line-height:18px;color:${EMAIL_COLORS.muted};">
${content.fallbackHint}<br>
<a href="${safeUrl}" style="color:${EMAIL_COLORS.muted};word-break:break-all;">${safeUrl}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
