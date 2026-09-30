import { redactPii } from "@/lib/redact-pii";

describe("redactPii", () => {
  it("redacts a top-level email key", () => {
    expect(redactPii({ email: "a@b.com", plan: "free" })).toEqual({
      email: "[REDACTED]",
      plan: "free",
    });
  });

  it("redacts a nested password key inside an array of objects", () => {
    expect(
      redactPii({ users: [{ name: "Ada", password: "hunter22" }] }),
    ).toEqual({ users: [{ name: "Ada", password: "[REDACTED]" }] });
  });

  it("replaces an email inside a free-text string", () => {
    expect(redactPii("Login failed for ada@example.com today")).toBe(
      "Login failed for [EMAIL] today",
    );
  });

  it("turns an Error into name and redacted message", () => {
    expect(redactPii(new Error("cannot send to ada@example.com"))).toEqual({
      name: "Error",
      message: "cannot send to [EMAIL]",
    });
  });

  it("returns a non-PII object unchanged", () => {
    const input = { fleetId: "fleet-1", count: 3, tags: ["a", "b"] };
    expect(redactPii(input)).toEqual(input);
  });
});
