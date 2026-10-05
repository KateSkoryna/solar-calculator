import { render, screen } from "@testing-library/react";
import ButtonLink from "./ButtonLink";

const LINK_LABEL = "Start my estimate";
const LINK_TARGET = "/calculator";

describe("ButtonLink", () => {
  it("renders a link to its target", () => {
    render(<ButtonLink href={LINK_TARGET}>{LINK_LABEL}</ButtonLink>);

    expect(screen.getByRole("link", { name: LINK_LABEL })).toHaveAttribute(
      "href",
      LINK_TARGET,
    );
  });

  it("does not render a button", () => {
    render(<ButtonLink href={LINK_TARGET}>{LINK_LABEL}</ButtonLink>);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
