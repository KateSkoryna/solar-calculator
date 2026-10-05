import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckEmailPanel from "./CheckEmailPanel";
import { savePendingSignInEmail } from "@/lib/pending-sign-in-email";
import { requestSignInLink } from "@/lib/request-sign-in-link";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

jest.mock("next-auth/react", () => ({ signIn: jest.fn() }));

jest.mock("@/lib/request-sign-in-link", () => ({
  requestSignInLink: jest.fn(),
}));

const mockedRequestSignInLink = jest.mocked(requestSignInLink);
const checkEmailMessages = englishMessages.checkEmail;
const RESEND_DELAY_SECONDS = 60;

function resendButton() {
  return screen.getByRole("button", { name: /Send it again/ });
}

function advanceSeconds(seconds: number) {
  act(() => {
    jest.advanceTimersByTime(seconds * 1000);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockedRequestSignInLink.mockReset();
  sessionStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("CheckEmailPanel", () => {
  it("names the address the link was sent to and how long it works", () => {
    savePendingSignInEmail("maria@example.com");

    renderWithIntl(<CheckEmailPanel />);

    expect(
      screen.getByText(
        "We sent a link to maria@example.com. It works for 15 minutes.",
      ),
    ).toBeInTheDocument();
  });

  it("still makes sense when the address is not known", () => {
    renderWithIntl(<CheckEmailPanel />);

    expect(
      screen.getByText("We sent you a sign-in link. It works for 15 minutes."),
    ).toBeInTheDocument();
    expect(resendButton()).toBeDisabled();
  });

  it("keeps Send it again disabled for 60 seconds, counting down", () => {
    savePendingSignInEmail("maria@example.com");
    renderWithIntl(<CheckEmailPanel />);

    expect(resendButton()).toBeDisabled();
    expect(resendButton()).toHaveTextContent("Send it again in 60s");

    advanceSeconds(RESEND_DELAY_SECONDS - 1);

    expect(resendButton()).toBeDisabled();
    expect(resendButton()).toHaveTextContent("Send it again in 1s");

    advanceSeconds(1);

    expect(resendButton()).toBeEnabled();
    expect(resendButton()).toHaveTextContent(checkEmailMessages.resend);
  });

  it("sends a new link, confirms it and waits another 60 seconds", async () => {
    savePendingSignInEmail("maria@example.com");
    mockedRequestSignInLink.mockResolvedValue("sent");
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithIntl(<CheckEmailPanel />);
    advanceSeconds(RESEND_DELAY_SECONDS);

    await user.click(resendButton());

    expect(mockedRequestSignInLink).toHaveBeenCalledWith(
      "maria@example.com",
      "en",
    );
    expect(await screen.findByText(checkEmailMessages.resent)).toBeVisible();
    expect(resendButton()).toBeDisabled();
  });

  it("says so when the new link could not be sent", async () => {
    savePendingSignInEmail("maria@example.com");
    mockedRequestSignInLink.mockResolvedValue("failed");
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithIntl(<CheckEmailPanel />);
    advanceSeconds(RESEND_DELAY_SECONDS);

    await user.click(resendButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      checkEmailMessages.resendFailed,
    );
    expect(resendButton()).toBeEnabled();
  });

  it("links back to the sign-in page to use a different email", () => {
    renderWithIntl(<CheckEmailPanel />);

    expect(
      screen.getByRole("link", { name: checkEmailMessages.differentEmail }),
    ).toHaveAttribute("href", "/en/login");
  });
});
