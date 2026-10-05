import { screen } from "@testing-library/react";
import FleetSwitcher from "./FleetSwitcher";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const BERLIN = { id: "fleet_berlin", name: "Berlin Delivery", slug: "berlin" };
const HAMBURG = { id: "fleet_hamburg", name: "Hamburg Cargo", slug: "hamburg" };

describe("FleetSwitcher", () => {
  it("shows a menu of fleets when the user belongs to several", () => {
    renderWithIntl(
      <FleetSwitcher
        fleets={[BERLIN, HAMBURG]}
        currentFleetSlug={BERLIN.slug}
        variant="sidebar"
      />,
    );

    expect(
      screen.getByLabelText(englishMessages.workspace.switchFleet),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: HAMBURG.name, hidden: true }),
    ).toHaveAttribute("href", "/en/hamburg");
    expect(
      screen.getByRole("link", { name: BERLIN.name, hidden: true }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("shows a static label without a menu when there is one fleet", () => {
    renderWithIntl(
      <FleetSwitcher
        fleets={[BERLIN]}
        currentFleetSlug={BERLIN.slug}
        variant="compact"
      />,
    );

    expect(screen.getByTestId("fleet-label")).toHaveTextContent(BERLIN.name);
    expect(
      screen.queryByLabelText(englishMessages.workspace.switchFleet),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
