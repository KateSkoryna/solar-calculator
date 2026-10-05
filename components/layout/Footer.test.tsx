import { screen } from "@testing-library/react";
import Footer from "./Footer";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

describe("Footer", () => {
  it("shows the copyright line with the current year and the tagline", () => {
    renderWithIntl(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(
      `© ${new Date().getFullYear()} Solar Calculator`,
    );
    expect(footer).toHaveTextContent(englishMessages.footer.tagline);
  });
});
