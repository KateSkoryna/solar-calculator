import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import { NextRequest, NextResponse } from "next/server";
import { workspacePath } from "@/lib/workspace-path";
import {
  checkRateLimit,
  SENSITIVE_ENDPOINT_RATE_LIMIT,
} from "@/lib/rate-limit";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

interface RateLimitedRoute {
  name: string;
  method: string;
  path: string;
}

const RATE_LIMITED_ROUTES: RateLimitedRoute[] = [
  {
    name: "email-sign-in",
    method: "POST",
    path: "/api/auth/signin/nodemailer",
  },
  {
    name: "calculation-create",
    method: "POST",
    path: "/api/fleets/:fleetId/calculations",
  },
  {
    name: "fleet-create",
    method: "POST",
    path: "/api/fleets",
  },
];

function compilePathPattern(pattern: string): RegExp {
  const regexSource = pattern
    .split("/")
    .map((segment) => (segment.startsWith(":") ? "[^/]+" : segment))
    .join("/");
  return new RegExp(`^${regexSource}$`);
}

const routeMatchers = RATE_LIMITED_ROUTES.map((route) => ({
  ...route,
  pathRegex: compilePathPattern(route.path),
}));

function findRateLimitedRoute(pathname: string, method: string) {
  return routeMatchers.find(
    (route) => route.method === method && route.pathRegex.test(pathname),
  );
}

function getLocaleFromPathname(pathname: string) {
  const firstSegment = pathname.split("/")[1];
  return locales.find((locale) => locale === firstSegment) ?? defaultLocale;
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rateLimitedRoute = findRateLimitedRoute(pathname, request.method);

  if (rateLimitedRoute) {
    const key = `${rateLimitedRoute.name}:${getClientIp(request)}`;
    const allowed = checkRateLimit(key, SENSITIVE_ENDPOINT_RATE_LIMIT);

    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!token;
  const isAuthRoute =
    pathname.endsWith("/login") || pathname.endsWith("/register");
  const isProtectedRoute = pathname.endsWith("/user");

  if (isProtectedRoute && !isLoggedIn) {
    const locale = getLocaleFromPathname(pathname);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    const locale = getLocaleFromPathname(pathname);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = workspacePath(locale);
    return NextResponse.redirect(redirectUrl);
  }

  return intlMiddleware(request);
}

// Next.js statically parses `matcher` at build time, so it can't be computed
// from RATE_LIMITED_ROUTES — these paths must stay in sync with it by hand.
export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/api/auth/signin/nodemailer",
    "/api/fleets/:fleetId/calculations",
    "/api/fleets",
  ],
};
