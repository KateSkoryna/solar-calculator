import { logger } from "@/lib/logger";

describe("logger", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let stdoutWrite: jest.SpyInstance;
  let stderrWrite: jest.SpyInstance;

  beforeEach(() => {
    stdoutWrite = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    stderrWrite = jest
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.assign(process.env, { NODE_ENV: originalNodeEnv });
  });

  it("writes one JSON line without the logged email", () => {
    logger.info("user_seen", { email: "a@b.com" });

    const output = String(stdoutWrite.mock.calls[0][0]);
    expect(output).not.toContain("a@b.com");
    const parsed = JSON.parse(output);
    expect(parsed).toMatchObject({
      level: "info",
      event: "user_seen",
      context: { email: "[REDACTED]" },
    });
    expect(typeof parsed.timestamp).toBe("string");
  });

  it("writes errors to stderr", () => {
    logger.error("boom", { error: new Error("failed for a@b.com") });

    const output = String(stderrWrite.mock.calls[0][0]);
    expect(output).not.toContain("a@b.com");
    expect(output).toContain("[EMAIL]");
  });

  it("suppresses debug output in production", () => {
    Object.assign(process.env, { NODE_ENV: "production" });

    logger.debug("hidden");

    expect(stdoutWrite).not.toHaveBeenCalled();
  });

  it("emits debug output outside production", () => {
    Object.assign(process.env, { NODE_ENV: "development" });

    logger.debug("visible");

    expect(stdoutWrite).toHaveBeenCalledTimes(1);
  });
});

describe("logger with unserializable context", () => {
  it("does not throw on circular context", () => {
    const stdoutWrite = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(() => logger.info("circular", { circular })).not.toThrow();
    expect(String(stdoutWrite.mock.calls[0][0])).toContain("[UNSERIALIZABLE]");
    stdoutWrite.mockRestore();
  });
});
