import { redactPii } from "@/lib/redact-pii";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

function serializeLogLine(
  level: LogLevel,
  event: string,
  context?: LogContext,
): string {
  const timestamp = new Date().toISOString();
  try {
    return JSON.stringify({
      level,
      event,
      timestamp,
      context: context === undefined ? undefined : redactPii(context),
    });
  } catch {
    return JSON.stringify({
      level,
      event,
      timestamp,
      context: "[UNSERIALIZABLE]",
    });
  }
}

function writeLog(level: LogLevel, event: string, context?: LogContext) {
  if (level === "debug" && process.env.NODE_ENV === "production") {
    return;
  }

  const line = serializeLogLine(level, event, context);

  const stream = level === "error" || level === "warn" ? "stderr" : "stdout";
  process[stream].write(`${line}\n`);
}

export const logger = {
  debug: (event: string, context?: LogContext) =>
    writeLog("debug", event, context),
  info: (event: string, context?: LogContext) =>
    writeLog("info", event, context),
  warn: (event: string, context?: LogContext) =>
    writeLog("warn", event, context),
  error: (event: string, context?: LogContext) =>
    writeLog("error", event, context),
};
