import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("SegmentedControl as tabs", () => {
  const tabs = [
    { id: "activity", label: "Activity", panelId: "activity-panel" },
    { id: "team", label: "Team", panelId: "team-panel" },
  ];

  function TabsHarness() {
    const [selectedTabId, setSelectedTabId] = useState("activity");
    return (
      <SegmentedControl
        label="Team and activity"
        tabs={tabs}
        selectedTabId={selectedTabId}
        onSelectTab={setSelectedTabId}
      />
    );
  }

  it("exposes a tablist of tabs with the selected one marked", () => {
    render(<TabsHarness />);

    expect(
      screen.getByRole("tablist", { name: "Team and activity" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Team" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("points each tab at its panel", () => {
    render(<TabsHarness />);

    expect(screen.getByRole("tab", { name: "Team" })).toHaveAttribute(
      "aria-controls",
      "team-panel",
    );
  });

  it("switches and focuses the next tab with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<TabsHarness />);

    await user.click(screen.getByRole("tab", { name: "Activity" }));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Team" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Team" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
  });

  it("only puts the selected tab in the tab order", () => {
    render(<TabsHarness />);

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("tab", { name: "Team" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });
});
