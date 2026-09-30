import { createTranslator } from "next-intl";
import { defaultLocale, locales, type Locale } from "@/i18n";
import { renderSignInEmailHtml } from "@/lib/email/sign-in-email-template";
import { SIGN_IN_LINK_MAX_AGE_SECONDS } from "@/lib/sign-in-link-limits";

const SECONDS_PER_MINUTE = 60;

export interface SignInEmailContent {
  subject: string;
  html: string;
  text: string;
}

export function resolveLocaleFromCallbackUrl(signInUrl: string): Locale {
  const callbackUrl = new URL(signInUrl).searchParams.get("callbackUrl");
  if (!callbackUrl) return defaultLocale;

  const firstPathSegment = new URL(callbackUrl, signInUrl).pathname.split(
    "/",
  )[1];
  return locales.find((locale) => locale === firstPathSegment) ?? defaultLocale;
}

export async function buildSignInEmail(
  signInUrl: string,
): Promise<SignInEmailContent> {
  const locale = resolveLocaleFromCallbackUrl(signInUrl);
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const translate = createTranslator({
    locale,
    messages,
    namespace: "signInEmail",
  });

  const expiry = translate("expiry", {
    minutes: SIGN_IN_LINK_MAX_AGE_SECONDS / SECONDS_PER_MINUTE,
  });

  return {
    subject: translate("subject"),
    text: `${translate("intro")}\n\n${signInUrl}\n\n${expiry}\n${translate("ignore")}`,
    html: renderSignInEmailHtml({
      locale,
      intro: translate("intro"),
      buttonLabel: translate("button"),
      fallbackHint: translate("fallback"),
      expiry,
      ignoreNotice: translate("ignore"),
      signInUrl,
    }),
  };
}
