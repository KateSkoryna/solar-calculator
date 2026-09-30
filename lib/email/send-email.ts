import { logger } from "@/lib/logger";
import { smtpSender } from "@/lib/email/smtp-sender";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

const activeEmailSender: EmailSender = smtpSender;

function shouldSkipSendingInDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" && !process.env.EMAIL_SERVER_PASSWORD
  );
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (shouldSkipSendingInDevelopment()) {
    logger.debug("email_skipped_in_development", {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return;
  }

  await activeEmailSender.send(message);
}
