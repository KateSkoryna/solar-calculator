const SMTP_SECURE_PORT = 465;

export const REQUIRED_SMTP_ENVIRONMENT_VARIABLES = [
  "EMAIL_SERVER_HOST",
  "EMAIL_SERVER_PORT",
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "EMAIL_FROM",
] as const;

export function findMissingSmtpEnvironmentVariables(): string[] {
  return REQUIRED_SMTP_ENVIRONMENT_VARIABLES.filter(
    (variableName) => !process.env[variableName],
  );
}

export function getSmtpServerConfig() {
  const port = Number(process.env.EMAIL_SERVER_PORT || SMTP_SECURE_PORT);

  return {
    host: process.env.EMAIL_SERVER_HOST ?? "",
    port,
    secure: port === SMTP_SECURE_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER ?? "",
      pass: process.env.EMAIL_SERVER_PASSWORD ?? "",
    },
  };
}
