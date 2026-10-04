import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";
import { auth } from "@/auth";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";
import {
  stubDialogElement,
  stubMatchMedia,
} from "@/test-support/stub-dialog-element";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/en",
}));

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

const headerMessages = englishMessages.header;
const mockedAuth = auth as unknown as jest.Mock;

const SIGNED_IN_SESSION = {
  user: { name: "Maria Schmidt", email: "maria@example.com", image: null },
};

async function renderHeader(session: typeof SIGNED_IN_SESSION | null) {
  mockedAuth.mockResolvedValue(session);
  renderWithIntl(await Header());
  return within(screen.getByRole("banner"));
}

describe("Header", () => {
  beforeAll(() => {
    stubDialogElement();
    stubMatchMedia();
  });

  it("shows the logo as a link to the home page", async () => {
    const header = await renderHeader(null);

    expect(
      header.getByRole("link", { name: headerMessages.title }),
    ).toHaveAttribute("href", "/en");
  });

  it("shows a Log in link without a session", async () => {
    const header = await renderHeader(null);

    expect(
      header.getAllByRole("link", { name: headerMessages.logIn })[0],
    ).toHaveAttribute("href", "/en/login");
  });

  it("hides My fleet without a session", async () => {
    const header = await renderHeader(null);

    expect(
      header.queryByRole("link", { name: headerMessages.myFleet }),
    ).not.toBeInTheDocument();
  });

  it("shows My fleet and the account menu with a session", async () => {
    const header = await renderHeader(SIGNED_IN_SESSION);

    expect(
      header.getAllByRole("link", { name: headerMessages.myFleet })[0],
    ).toHaveAttribute("href", "/en/workspace");
    expect(
      header.getByRole("button", { name: headerMessages.userMenu }),
    ).toBeInTheDocument();
    expect(
      header.queryByRole("link", { name: headerMessages.logIn }),
    ).not.toBeInTheDocument();
  });

  it("always links to How it works and the calculator", async () => {
    const header = await renderHeader(null);

    expect(
      header.getAllByRole("link", { name: headerMessages.howItWorks })[0],
    ).toHaveAttribute("href", "/en#how-it-works");
    expect(
      header.getAllByRole("link", { name: headerMessages.calculator })[0],
    ).toHaveAttribute("href", "/en/calculator");
  });

  it("toggles aria-expanded on the hamburger button", async () => {
    const header = await renderHeader(null);
    const openButton = header.getByRole("button", {
      name: headerMessages.openMenu,
    });
    expect(openButton).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(openButton);
    expect(openButton).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(
      header.getByRole("button", { name: headerMessages.closeMenu }),
    );
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(openButton).toHaveFocus();
  });

  it("opens the account menu with a link to the account page", async () => {
    const header = await renderHeader(SIGNED_IN_SESSION);
    const menuButton = header.getByRole("button", {
      name: headerMessages.userMenu,
    });

    await userEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(
      header.getAllByRole("link", { name: headerMessages.myAccount })[0],
    ).toHaveAttribute("href", "/en/user");
  });
});
