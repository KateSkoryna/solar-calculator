import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VehicleType } from "@/app/generated/prisma/enums";
import VehicleGroupList from "./VehicleGroupList";
import type {
  FleetVehicleGroup,
  GroupCalculation,
} from "@/lib/fleet-dashboard";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const CURRENT_VERSION = "2026.1";
const FLEET_PATH = "/en/berlin";
const VEHICLES_PATH = "/en/berlin/vehicles";
const groupMessages = englishMessages.overview.groups;

function calculation(overrides: Partial<GroupCalculation> = {}) {
  return {
    id: "calc_1",
    assumptionSetVersion: CURRENT_VERSION,
    paybackMonths: 52,
    annualSavingsEuros: 1000,
    co2AvoidedKgPerYear: 500,
    ...overrides,
  };
}

function group(overrides: Partial<FleetVehicleGroup> = {}): FleetVehicleGroup {
  return {
    vehicleId: "vehicle_1",
    manufacturer: "Ford",
    model: "Transit",
    vehicleType: VehicleType.VAN,
    city: "Berlin",
    quantity: 10,
    latestCalculation: calculation(),
    ...overrides,
  };
}

function renderList(groups: FleetVehicleGroup[]) {
  renderWithIntl(
    <VehicleGroupList
      groups={groups}
      currentAssumptionSetVersion={CURRENT_VERSION}
      fleetPath={FLEET_PATH}
      vehiclesPath={VEHICLES_PATH}
    />,
  );
}

describe("VehicleGroupList", () => {
  it("links a calculated group to its latest result", () => {
    renderList([group()]);

    expect(screen.getByRole("link", { name: /Ford Transit/ })).toHaveAttribute(
      "href",
      `${FLEET_PATH}/calculations/calc_1`,
    );
    expect(
      screen.getByText(groupMessages.status.calculated),
    ).toBeInTheDocument();
    expect(screen.getByText(/4 years 4 months/)).toBeInTheDocument();
  });

  it("shows a stale calculation as needing a new calculation", () => {
    renderList([
      group({
        latestCalculation: calculation({ assumptionSetVersion: "2025.2" }),
      }),
    ]);

    expect(
      screen.getByText(groupMessages.status.needsCalculation),
    ).toBeInTheDocument();
    expect(screen.queryByText(/4 years/)).not.toBeInTheDocument();
  });

  it("sends a group without a calculation to the vehicles page", () => {
    renderList([group({ latestCalculation: null })]);

    expect(screen.getByRole("link", { name: /Ford Transit/ })).toHaveAttribute(
      "href",
      VEHICLES_PATH,
    );
    expect(
      screen.getByText(groupMessages.status.needsCalculation),
    ).toBeInTheDocument();
  });

  it("says when a calculated group never pays off", () => {
    renderList([
      group({ latestCalculation: calculation({ paybackMonths: null }) }),
    ]);

    expect(screen.getByText(groupMessages.doesNotPayOff)).toBeInTheDocument();
  });

  it("filters the groups with the search field", async () => {
    const user = userEvent.setup();
    renderList([
      group(),
      group({
        vehicleId: "vehicle_2",
        manufacturer: "Scania",
        model: "R450",
        city: "Hamburg",
      }),
    ]);

    await user.type(screen.getByLabelText(groupMessages.search), "scania");

    expect(screen.queryByText(/Ford Transit/)).not.toBeInTheDocument();
    expect(screen.getByText(/Scania R450/)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(groupMessages.search));
    await user.type(screen.getByLabelText(groupMessages.search), "nothing");

    expect(screen.getByText(groupMessages.noMatch)).toBeInTheDocument();
  });
});
