export const PII_KEYS = [
  "email",
  "password",
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "authorization",
  "cookie",
] as const;

const REDACTED_VALUE = "[REDACTED]";
const REDACTED_EMAIL = "[EMAIL]";
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const piiKeySet = new Set<string>(PII_KEYS.map((key) => key.toLowerCase()));

function redactString(text: string): string {
  return text.replace(EMAIL_PATTERN, REDACTED_EMAIL);
}

export function redactPii(value: unknown): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }

  if (value instanceof Error) {
    return { name: value.name, message: redactString(value.message) };
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(redactPii);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        piiKeySet.has(key.toLowerCase())
          ? REDACTED_VALUE
          : redactPii(entryValue),
      ]),
    );
  }

  return value;
}
