import { locales } from "@/i18n";

export const AUTH_SCREEN_SEGMENTS = [
  "login",
  "register",
  "check-email",
  "onboarding",
] as const;

export function isAuthScreenPath(pathname: string) {
  const [, firstSegment, secondSegment] = pathname.split("/");
  const isLocale = (locales as readonly string[]).includes(firstSegment);
  const screenSegment = isLocale ? secondSegment : firstSegment;
  return (AUTH_SCREEN_SEGMENTS as readonly string[]).includes(screenSegment);
}
