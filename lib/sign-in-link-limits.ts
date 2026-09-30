import { createHash } from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export const SIGN_IN_LINK_MAX_AGE_SECONDS = 900;
export const DAILY_SIGN_IN_EMAIL_LIMIT = 400;

const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * MILLISECONDS_PER_SECOND;
const LINKS_PER_ADDRESS_LIMIT = 3;

const PER_ADDRESS_RATE_LIMIT = {
  windowMs: SIGN_IN_LINK_MAX_AGE_SECONDS * MILLISECONDS_PER_SECOND,
  maxRequests: LINKS_PER_ADDRESS_LIMIT,
};

const DAILY_RATE_LIMIT = {
  windowMs: MILLISECONDS_PER_DAY,
  maxRequests: DAILY_SIGN_IN_EMAIL_LIMIT,
};

const DAILY_LIMIT_KEY = "sign-in-email:daily";

export const SignInLinkDecision = {
  ALLOWED: "ALLOWED",
  ADDRESS_LIMIT_REACHED: "ADDRESS_LIMIT_REACHED",
  DAILY_LIMIT_REACHED: "DAILY_LIMIT_REACHED",
} as const;

export type SignInLinkDecision =
  (typeof SignInLinkDecision)[keyof typeof SignInLinkDecision];

function hashEmailAddress(emailAddress: string): string {
  return createHash("sha256")
    .update(emailAddress.trim().toLowerCase())
    .digest("hex");
}

export function decideSignInLink(emailAddress: string): SignInLinkDecision {
  const addressKey = `sign-in-email:address:${hashEmailAddress(emailAddress)}`;

  if (!checkRateLimit(addressKey, PER_ADDRESS_RATE_LIMIT)) {
    return SignInLinkDecision.ADDRESS_LIMIT_REACHED;
  }

  if (!checkRateLimit(DAILY_LIMIT_KEY, DAILY_RATE_LIMIT)) {
    return SignInLinkDecision.DAILY_LIMIT_REACHED;
  }

  return SignInLinkDecision.ALLOWED;
}
