import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileMenu from "./MobileMenu";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";
import {
  stubDialogElement,
  stubMatchMedia,
} from "@/test-support/stub-dialog-element";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/en",
}));

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

const headerMessages = englishMessages.header;

const NAV_LINKS = [
  { label: headerMessages.howItWorks, href: "/en#how-it-works" },
  { label: headerMessages.calculator, href: "/en/calculator" },
];

function renderMobileMenu(isSignedIn = false) {
  renderWithIntl(<MobileMenu navLinks={NAV_LINKS} isSignedIn={isSignedIn} />);
  return {
    openButton: screen.getByRole("button", { name: headerMessages.openMenu }),
    dialog: screen.getByRole("dialog", { hidden: true }),
  };
}

describe("MobileMenu", () => {
  let viewport: ReturnType<typeof stubMatchMedia>;

  beforeAll(stubDialogElement);

  beforeEach(() => {
    viewport = stubMatchMedia();
  });

  it("starts closed with a named, collapsed hamburger button", () => {
    const { openButton, dialog } = renderMobileMenu();

    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(dialog).not.toHaveAttribute("open");
  });

  it("opens as a modal dialog and marks the button expanded", async () => {
    const { openButton, dialog } = renderMobileMenu();

    await userEvent.click(openButton);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(dialog).toHaveAttribute("open");
    expect(openButton).toHaveAttribute("aria-expanded", "true");
  });

  it("closes from the close button and returns focus to the hamburger", async () => {
    const { openButton, dialog } = renderMobileMenu();
    await userEvent.click(openButton);

    await userEvent.click(
      screen.getByRole("button", { name: headerMessages.closeMenu }),
    );

    expect(dialog).not.toHaveAttribute("open");
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(openButton).toHaveFocus();
  });

  it("closes on Escape and returns focus to the hamburger", async () => {
    const { openButton, dialog } = renderMobileMenu();
    await userEvent.click(openButton);

    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    expect(dialog).not.toHaveAttribute("open");
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(openButton).toHaveFocus();
  });

  it("closes when a link is clicked", async () => {
    const { openButton, dialog } = renderMobileMenu();
    await userEvent.click(openButton);

    const calculatorLink = screen.getByRole("link", {
      name: headerMessages.calculator,
    });
    calculatorLink.addEventListener("click", (event) => event.preventDefault());

    await userEvent.click(calculatorLink);

    expect(dialog).not.toHaveAttribute("open");
  });

  it("offers Log in without a session", async () => {
    const { openButton } = renderMobileMenu(false);
    await userEvent.click(openButton);

    expect(
      screen.getByRole("link", { name: headerMessages.logIn }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: headerMessages.logOut }),
    ).not.toBeInTheDocument();
  });

  it("offers the account link and Log out with a session", async () => {
    const { openButton } = renderMobileMenu(true);
    await userEvent.click(openButton);

    expect(
      screen.getByRole("link", { name: headerMessages.myAccount }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: headerMessages.logOut }),
    ).toBeInTheDocument();
  });

  it("closes when the viewport grows to the desktop layout", async () => {
    const { openButton, dialog } = renderMobileMenu();
    await userEvent.click(openButton);

    act(() => viewport.changeViewportMatch(true));

    expect(dialog).not.toHaveAttribute("open");
    expect(openButton).toHaveAttribute("aria-expanded", "false");
  });
});
