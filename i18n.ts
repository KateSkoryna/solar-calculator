import { getRequestConfig } from "next-intl/server";

// Supported locales
export const locales = ["en", "de", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const DISPLAY_TIME_ZONE = "Europe/Berlin";

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale parameter is valid
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    timeZone: DISPLAY_TIME_ZONE,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
