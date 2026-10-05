import { render, screen } from "@testing-library/react";
import SegmentedControl from "./SegmentedControl";

describe("SegmentedControl", () => {
  const links = [
    { label: "Log in", href: "/en/login", isCurrent: true },
    { label: "Create account", href: "/en/register", isCurrent: false },
  ];

  it("links each segment to its own address", () => {
    render(<SegmentedControl label="Account" links={links} />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/en/login",
    );
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/en/register");
  });

  it("marks only the current page with aria-current", () => {
    render(<SegmentedControl label="Account" links={links} />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("is a named navigation landmark", () => {
    render(<SegmentedControl label="Account" links={links} />);

    expect(
      screen.getByRole("navigation", { name: "Account" }),
    ).toBeInTheDocument();
  });
});
