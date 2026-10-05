import NextAuth from "next-auth";
import { sendSignInLink } from "@/lib/email/send-sign-in-link";
import { SIGN_IN_LINK_MAX_AGE_SECONDS } from "@/lib/sign-in-link-lifetime";

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: {},
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}));
jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: "google" })),
}));
jest.mock("next-auth/providers/nodemailer", () => ({
  __esModule: true,
  default: jest.fn((options) => ({ id: "nodemailer", options })),
}));
jest.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: {} }));
jest.mock("@/lib/email/send-sign-in-link", () => ({
  sendSignInLink: jest.fn(),
}));

async function loadAuthConfig() {
  await jest.isolateModulesAsync(async () => {
    await import("@/auth");
  });
  return (NextAuth as unknown as jest.Mock).mock.calls[0][0];
}

describe("auth configuration", () => {
  it("has the Google and Nodemailer providers and no password provider", async () => {
    const providerIds = (await loadAuthConfig()).providers.map(
      (provider: { id: string }) => provider.id,
    );

    expect(providerIds).toEqual(["google", "nodemailer"]);
    expect(providerIds).not.toContain("credentials");
  });

  it("sends links through sendSignInLink with a 15 minute lifetime", async () => {
    const nodemailerProvider = (await loadAuthConfig()).providers.find(
      (provider: { id: string }) => provider.id === "nodemailer",
    );

    expect(nodemailerProvider.options.sendVerificationRequest).toBe(
      sendSignInLink,
    );
    expect(nodemailerProvider.options.maxAge).toBe(
      SIGN_IN_LINK_MAX_AGE_SECONDS,
    );
  });
});
