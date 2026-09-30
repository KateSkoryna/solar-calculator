import { createTransport } from "nodemailer";
import type { EmailMessage, EmailSender } from "@/lib/email/send-email";
import {
  findMissingSmtpEnvironmentVariables,
  getSmtpServerConfig,
} from "@/lib/email/smtp-settings";

function assertSmtpIsConfigured() {
  const missingVariables = findMissingSmtpEnvironmentVariables();

  if (missingVariables.length > 0) {
    throw new Error(`Missing SMTP settings: ${missingVariables.join(", ")}`);
  }
}

export const smtpSender: EmailSender = {
  async send({ to, subject, html, text }: EmailMessage) {
    assertSmtpIsConfigured();

    const transport = createTransport(getSmtpServerConfig());
    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
  },
};
