import { screen } from "@testing-library/react";
import Logo from "./Logo";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

describe("Logo", () => {
  it("shows the product name", () => {
    renderWithIntl(<Logo />);

    expect(screen.getByText(englishMessages.header.title)).toBeInTheDocument();
  });

  it("shows the product name on dark panels", () => {
    renderWithIntl(<Logo onDark />);

    expect(screen.getByText(englishMessages.header.title)).toBeInTheDocument();
  });
});
