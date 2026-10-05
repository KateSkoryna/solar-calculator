import { screen } from "@testing-library/react";
import AuthShell from "./AuthShell";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

jest.mock("next/navigation", () => ({
  usePathname: () => "/en/login",
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: jest.fn() }),
}));

const shellMessages = englishMessages.authShell;

describe("AuthShell", () => {
  beforeEach(() => {
    renderWithIntl(
      <AuthShell>
        <p>Form goes here</p>
      </AuthShell>,
    );
  });

  it("shows the form next to the headline and the three benefits", () => {
    expect(screen.getByText("Form goes here")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: shellMessages.headline }),
    ).toBeInTheDocument();
    for (const benefit of Object.values(shellMessages.benefits)) {
      expect(screen.getByText(benefit)).toBeInTheDocument();
    }
    expect(screen.getByText(shellMessages.footer)).toBeInTheDocument();
  });

  it("offers a way back home from the logo and from the close button", () => {
    expect(
      screen.getByRole("link", { name: shellMessages.close }),
    ).toHaveAttribute("href", "/en");
    for (const logoLink of screen.getAllByRole("link", {
      name: englishMessages.header.title,
    })) {
      expect(logoLink).toHaveAttribute("href", "/en");
    }
  });
});
