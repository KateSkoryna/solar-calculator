import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!token;
  const isAuthRoute =
    pathname.endsWith("/login") || pathname.endsWith("/register");
  const isProtectedRoute = pathname.endsWith("/user");

  if (isProtectedRoute && !isLoggedIn) {
    const locale = pathname.split("/")[1];
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    const locale = pathname.split("/")[1];
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/user`;
    return NextResponse.redirect(redirectUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
