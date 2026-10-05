import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInPanel from "./SignInPanel";
import { readPendingSignInEmail } from "@/lib/pending-sign-in-email";
import { requestSignInLink } from "@/lib/request-sign-in-link";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const pushMock = jest.fn();
const searchParamsMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParamsMock(),
}));

jest.mock("next-auth/react", () => ({ signIn: jest.fn() }));

jest.mock("@/lib/request-sign-in-link", () => ({
  requestSignInLink: jest.fn(),
}));

const mockedRequestSignInLink = jest.mocked(requestSignInLink);
const signInMessages = englishMessages.signIn;
const emailMessages = englishMessages.emailSignIn;
const authMessages = englishMessages.auth;

function withQuery(query: string) {
  searchParamsMock.mockReturnValue(new URLSearchParams(query));
}

async function sendLinkTo(address: string) {
  await userEvent.type(
    screen.getByRole("textbox", { name: emailMessages.email }),
    address,
  );
  await userEvent.click(
    screen.getByRole("button", { name: emailMessages.submitButton }),
  );
}

beforeEach(() => {
  pushMock.mockReset();
  mockedRequestSignInLink.mockReset();
  sessionStorage.clear();
  withQuery("");
});

describe("SignInPanel", () => {
  it("shows the log in copy and marks Log in as the current page", () => {
    renderWithIntl(<SignInPanel mode="login" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: signInMessages.login.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: signInMessages.login.google }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: signInMessages.tabs.login }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: signInMessages.tabs.register }),
    ).toHaveAttribute("href", "/en/register");
  });

  it("shows the create account copy on the register page", () => {
    renderWithIntl(<SignInPanel mode="register" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: signInMessages.register.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: signInMessages.tabs.register }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("asks for nothing but an email address", () => {
    renderWithIntl(<SignInPanel mode="login" />);

    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });

  it("goes to check-email and remembers the address after sending", async () => {
    mockedRequestSignInLink.mockResolvedValue("sent");
    renderWithIntl(<SignInPanel mode="login" />);

    await sendLinkTo("maria@example.com");

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/en/check-email"),
    );
    expect(mockedRequestSignInLink).toHaveBeenCalledWith(
      "maria@example.com",
      "en",
    );
    expect(readPendingSignInEmail()).toBe("maria@example.com");
  });

  it("explains a wrong address under the field and sends nothing", async () => {
    renderWithIntl(<SignInPanel mode="login" />);

    await sendLinkTo("not-an-address");

    expect(
      await screen.findByText(emailMessages.invalidEmail),
    ).toBeInTheDocument();
    expect(mockedRequestSignInLink).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows a form-level message when the link could not be sent", async () => {
    mockedRequestSignInLink.mockResolvedValue("failed");
    renderWithIntl(<SignInPanel mode="login" />);

    await sendLinkTo("maria@example.com");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      authMessages.emailSignInFailed,
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows the expired-link message with a way to get a new link", async () => {
    withQuery("error=Verification");
    mockedRequestSignInLink.mockResolvedValue("sent");
    renderWithIntl(<SignInPanel mode="login" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      authMessages.linkExpiredOrUsed,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: emailMessages.email }),
      "maria@example.com",
    );
    await userEvent.click(
      screen.getByRole("button", { name: emailMessages.sendNewLink }),
    );

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/en/check-email"),
    );
  });

  it("asks for a valid address when a new link is requested without one", async () => {
    withQuery("error=Verification");
    renderWithIntl(<SignInPanel mode="login" />);

    await userEvent.click(
      screen.getByRole("button", { name: emailMessages.sendNewLink }),
    );

    expect(
      await screen.findByText(emailMessages.invalidEmail),
    ).toBeInTheDocument();
    expect(mockedRequestSignInLink).not.toHaveBeenCalled();
  });

  it("shows no message when the page opens without an error", () => {
    renderWithIntl(<SignInPanel mode="login" />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("uses a plain message for an unknown error code", () => {
    withQuery("error=Whatever");
    renderWithIntl(<SignInPanel mode="login" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      authMessages.genericError,
    );
  });
});
