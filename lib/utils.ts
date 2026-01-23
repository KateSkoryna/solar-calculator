import { locales, Locale } from "@/i18n";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
