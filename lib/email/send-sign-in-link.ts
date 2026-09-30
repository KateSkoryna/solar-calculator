import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/email/send-email";
import { buildSignInEmail } from "@/lib/email/sign-in-email";
import {
  decideSignInLink,
  SignInLinkDecision,
} from "@/lib/sign-in-link-limits";

interface SignInLinkRequest {
  identifier: string;
  url: string;
}

export class DailySignInEmailLimitError extends Error {
  constructor() {
    super("Daily sign-in email limit reached");
    this.name = "DailySignInEmailLimitError";
  }
}

export async function sendSignInLink({
  identifier,
  url,
}: SignInLinkRequest): Promise<void> {
  const decision = decideSignInLink(identifier);

  if (decision === SignInLinkDecision.ADDRESS_LIMIT_REACHED) {
    logger.warn("sign_in_link_address_limit_reached");
    return;
  }

  if (decision === SignInLinkDecision.DAILY_LIMIT_REACHED) {
    logger.warn("sign_in_link_daily_limit_reached");
    throw new DailySignInEmailLimitError();
  }

  const { subject, html, text } = await buildSignInEmail(url);
  await sendEmail({ to: identifier, subject, html, text });
}
