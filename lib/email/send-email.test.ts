import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/email/send-email";

jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));

const mockedCreateTransport: jest.Mock =
  jest.requireMock("nodemailer").createTransport;
const sendMail = jest.fn();

const message = {
  to: "driver@example.com",
  subject: "Your link",
  html: "<p>Hello</p>",
  text: "Hello",
};

const smtpEnvironment = {
  EMAIL_SERVER_HOST: "smtp.gmail.com",
  EMAIL_SERVER_PORT: "465",
  EMAIL_SERVER_USER: "sender@gmail.com",
  EMAIL_SERVER_PASSWORD: "app-password",
  EMAIL_FROM: "SunFleet <sender@gmail.com>",
};

const originalEnvironment = { ...process.env };

function setEnvironment(overrides: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      Object.assign(process.env, { [key]: value });
    }
  }
}

beforeEach(() => {
  sendMail.mockReset().mockResolvedValue({ rejected: [], pending: [] });
  mockedCreateTransport.mockReset().mockReturnValue({ sendMail });
});

afterEach(() => {
  jest.restoreAllMocks();
  process.env = { ...originalEnvironment };
});

describe("sendEmail", () => {
  it("passes from, to, subject, html and text to the SMTP transport", async () => {
    setEnvironment({ ...smtpEnvironment, NODE_ENV: "production" });

    await sendEmail(message);

    expect(mockedCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: "sender@gmail.com", pass: "app-password" },
      }),
    );
    expect(sendMail).toHaveBeenCalledWith({
      from: smtpEnvironment.EMAIL_FROM,
      ...message,
    });
  });

  it("logs the message and creates no transport in development without a password", async () => {
    const debugLog = jest.spyOn(logger, "debug").mockImplementation(() => {});
    setEnvironment({
      ...smtpEnvironment,
      EMAIL_SERVER_PASSWORD: undefined,
      NODE_ENV: "development",
    });

    await sendEmail(message);

    expect(debugLog).toHaveBeenCalledWith(
      "email_skipped_in_development",
      expect.objectContaining({ text: message.text }),
    );
    expect(mockedCreateTransport).not.toHaveBeenCalled();
  });

  it("throws in production when SMTP settings are missing", async () => {
    setEnvironment({
      ...smtpEnvironment,
      EMAIL_SERVER_PASSWORD: undefined,
      NODE_ENV: "production",
    });

    await expect(sendEmail(message)).rejects.toThrow(
      "Missing SMTP settings: EMAIL_SERVER_PASSWORD",
    );
    expect(mockedCreateTransport).not.toHaveBeenCalled();
  });
});
