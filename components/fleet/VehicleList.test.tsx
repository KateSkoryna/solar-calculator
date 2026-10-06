import { screen } from "@testing-library/react";
import VehicleList from "./VehicleList";
import type { FleetVehicleRow } from "@/lib/fleet-vehicles";
import { renderWithIntl } from "@/test-support/render-with-intl";

function vehicle(overrides: Partial<FleetVehicleRow> = {}): FleetVehicleRow {
  return {
    id: "vehicle_1",
    name: "Berlin delivery vans",
    manufacturer: "Ford",
    model: "Transit",
    vehicleType: "VAN",
    city: "Berlin",
    quantity: 9,
    ...overrides,
  };
}

function renderList(canEdit: boolean, vehicles = [vehicle()]) {
  renderWithIntl(
    <VehicleList vehicles={vehicles} fleetSlug="berlin" canEdit={canEdit} />,
  );
}

describe("VehicleList", () => {
  it("shows the group name and count but no distance", () => {
    renderList(true);

    expect(screen.getByText("Berlin delivery vans")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.queryByText(/km/)).not.toBeInTheDocument();
  });

  it("gives editors an Edit button that opens the edit page", () => {
    renderList(true);

    expect(
      screen.getByRole("link", { name: "Edit Berlin delivery vans" }),
    ).toHaveAttribute("href", "/en/berlin/vehicles/vehicle_1/edit");
  });

  it("shows viewers the rows without an Edit button", () => {
    renderList(false);

    expect(screen.getByText("Berlin delivery vans")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("names a quick-check vehicle after its city and type", () => {
    renderList(true, [
      vehicle({ name: null, manufacturer: "Quick check", model: "VAN" }),
    ]);

    expect(screen.getByText("Berlin 9 Van")).toBeInTheDocument();
  });
});
