import { isAuthScreenPath } from "@/lib/auth-screens";

describe("isAuthScreenPath", () => {
  it.each(["/en/login", "/de/register", "/es/check-email", "/en/onboarding"])(
    "recognises %s",
    (pathname) => {
      expect(isAuthScreenPath(pathname)).toBe(true);
    },
  );

  it.each(["/en", "/en/calculator", "/en/results", "/en/berlin/login", "/"])(
    "keeps the site chrome on %s",
    (pathname) => {
      expect(isAuthScreenPath(pathname)).toBe(false);
    },
  );
});
