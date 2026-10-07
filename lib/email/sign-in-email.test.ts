import {
  buildSignInEmail,
  resolveLocaleFromCallbackUrl,
} from "@/lib/email/sign-in-email";

function signInUrlWithCallback(callbackUrl: string) {
  const query = new URLSearchParams({ callbackUrl, token: "abc" });
  return `https://solar.example.com/api/auth/callback/nodemailer?${query}`;
}

describe("buildSignInEmail", () => {
  it("contains the sign-in link in both html and text", async () => {
    const url = signInUrlWithCallback("https://solar.example.com/en/user");

    const email = await buildSignInEmail(url);

    expect(email.text).toContain(url);
    expect(email.html).toContain("href=");
    expect(email.html).toContain("token=abc");
  });

  it("uses a German subject for the de locale", async () => {
    const email = await buildSignInEmail(
      signInUrlWithCallback("https://solar.example.com/de/user"),
    );

    expect(email.subject).toBe("Ihr Anmeldelink für SunFleet");
  });

  it("mentions the 15 minute lifetime", async () => {
    const email = await buildSignInEmail(
      signInUrlWithCallback("https://solar.example.com/en/user"),
    );

    expect(email.text).toContain("15 minutes");
  });
});

describe("resolveLocaleFromCallbackUrl", () => {
  it("reads the locale from the first path segment", () => {
    expect(
      resolveLocaleFromCallbackUrl(
        signInUrlWithCallback("https://solar.example.com/es/user"),
      ),
    ).toBe("es");
  });

  it("falls back to en for an unknown locale or a missing callback", () => {
    expect(
      resolveLocaleFromCallbackUrl(
        signInUrlWithCallback("https://solar.example.com/fr/user"),
      ),
    ).toBe("en");
    expect(
      resolveLocaleFromCallbackUrl(
        "https://solar.example.com/api/auth/callback/nodemailer",
      ),
    ).toBe("en");
  });
});

describe("sign-in email html", () => {
  it("escapes the link in the html and keeps the button and fallback link", async () => {
    const url = signInUrlWithCallback("https://solar.example.com/en/user");

    const { html } = await buildSignInEmail(url);

    expect(html).toContain("&amp;token=abc");
    expect(html).not.toContain("&token=abc");
    expect(html.match(/href="/g)).toHaveLength(2);
    expect(html).toContain('lang="en"');
  });

  it("renders German copy for the de locale", async () => {
    const { html } = await buildSignInEmail(
      signInUrlWithCallback("https://solar.example.com/de/user"),
    );

    expect(html).toContain('lang="de"');
    expect(html).toContain("Anmelden");
  });
});
