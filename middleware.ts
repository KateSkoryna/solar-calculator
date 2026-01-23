import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix for all languages
  // This means: /en = English, /de = German, /es = Spanish
  localePrefix: "always",
});

export const config = {
  // Match only internationalized pathnames
  // Skip api routes, _next folder, and static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
