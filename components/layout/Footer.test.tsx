import { screen } from "@testing-library/react";
import Footer from "./Footer";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

describe("Footer", () => {
  it("shows the copyright line with the current year", () => {
    renderWithIntl(<Footer />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      `© ${new Date().getFullYear()} Solar Calculator`,
    );
  });

  it("links to the privacy and legal notice pages", () => {
    renderWithIntl(<Footer />);

    expect(
      screen.getByRole("link", { name: englishMessages.footer.privacy }),
    ).toHaveAttribute("href", "/en/privacy");
    expect(
      screen.getByRole("link", { name: englishMessages.footer.legalNotice }),
    ).toHaveAttribute("href", "/en/legal-notice");
  });
});
