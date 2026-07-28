import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import { NextRequest, NextResponse } from "next/server";
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
  { name: "login", method: "POST", path: "/api/auth/callback/credentials" },
  { name: "register", method: "POST", path: "/api/auth/register" },
  {
    name: "forgot-password",
    method: "POST",
    path: "/api/auth/forgot-password",
  },
  { name: "reset-password", method: "POST", path: "/api/auth/reset-password" },
  {
    name: "calculation-create",
    method: "POST",
    path: "/api/fleets/:fleetId/calculations",
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

// Next.js statically parses `matcher` at build time, so it can't be computed
// from RATE_LIMITED_ROUTES — these paths must stay in sync with it by hand.
export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/api/auth/callback/credentials",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/fleets/:fleetId/calculations",
  ],
};
