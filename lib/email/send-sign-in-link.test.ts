import { sendEmail } from "@/lib/email/send-email";
import {
  DailySignInEmailLimitError,
  sendSignInLink,
} from "@/lib/email/send-sign-in-link";
import { DAILY_SIGN_IN_EMAIL_LIMIT } from "@/lib/sign-in-link-limits";

jest.mock("@/lib/email/send-email", () => ({ sendEmail: jest.fn() }));

const mockedSendEmail = sendEmail as jest.Mock;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const signInUrl =
  "https://solar.example.com/api/auth/callback/nodemailer?callbackUrl=https%3A%2F%2Fsolar.example.com%2Fen%2Fuser&token=abc";

function requestLink(emailAddress: string) {
  return sendSignInLink({ identifier: emailAddress, url: signInUrl });
}

beforeEach(() => {
  mockedSendEmail.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("sendSignInLink per address limit", () => {
  it("sends the first three links and refuses the fourth within 15 minutes", async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await requestLink("repeat@example.com");
    }
    await requestLink("repeat@example.com");

    expect(mockedSendEmail).toHaveBeenCalledTimes(3);
  });

  it("counts addresses case-insensitively", async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await requestLink("Mixed@Example.com");
    }
    await requestLink("mixed@example.com");

    expect(mockedSendEmail).toHaveBeenCalledTimes(3);
  });
});

describe("sendSignInLink daily limit", () => {
  it("sends the expected message and refuses request 401 in a day", async () => {
    jest.useFakeTimers({ now: Date.now() + 2 * MILLISECONDS_PER_DAY });

    for (let index = 0; index < DAILY_SIGN_IN_EMAIL_LIMIT; index += 1) {
      await requestLink(`user-${index}@example.com`);
    }

    await expect(
      requestLink("one-too-many@example.com"),
    ).rejects.toBeInstanceOf(DailySignInEmailLimitError);
    expect(mockedSendEmail).toHaveBeenCalledTimes(DAILY_SIGN_IN_EMAIL_LIMIT);
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user-0@example.com",
        subject: "Your sign-in link for SunFleet",
      }),
    );
  });
});
