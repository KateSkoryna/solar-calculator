import { screen } from "@testing-library/react";
import VehicleEditForm from "./VehicleEditForm";
import {
  NO_COOLING_UNIT,
  type VehicleEditFormValues,
} from "@/lib/vehicle-edit-form";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const initialValues: VehicleEditFormValues = {
  name: "",
  manufacturer: "Ford",
  model: "Transit",
  vehicleType: "VAN",
  engineType: "DIESEL",
  parkingType: "DEPOT",
  quantity: 3,
  averageDailyDistanceKm: 80,
  energyConsumptionKwhPer100km: 30,
  solarPanelCapacityKw: 1,
  solarPanelPlacement: "ROOF",
  payloadReserveKg: 100,
  maxRoofLoadKg: 150,
  operatingMonthsPerYear: 12,
  winterUsage: true,
  city: "Berlin",
  country: "DE",
  cargoType: "REGULAR",
  idleHoursPerDay: 0,
  coolingUnitType: NO_COOLING_UNIT,
};

function renderForm(canDelete: boolean) {
  renderWithIntl(
    <VehicleEditForm
      fleetId="fleet_1"
      fleetSlug="berlin"
      vehicleId="vehicle_1"
      vehicleName="Berlin 3 Van"
      canDelete={canDelete}
      initialValues={initialValues}
    />,
  );
}

describe("VehicleEditForm", () => {
  it("uses the calculator's labels and hints for the shared numbers", () => {
    renderForm(false);
    const exactNumbers = englishMessages.calculator.exactNumbers;

    expect(
      screen.getByLabelText(exactNumbers.averageDailyDistanceKm.label),
    ).toHaveValue(80);
    expect(
      screen.getByText(exactNumbers.averageDailyDistanceKm.hint),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(exactNumbers.operatingMonthsPerYear.label),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(exactNumbers.energyConsumptionKwhPer100km.label),
    ).toBeInTheDocument();
  });

  it("offers Delete only to owners", () => {
    renderForm(false);
    expect(
      screen.queryByRole("button", {
        name: englishMessages.vehicles.edit.delete.button,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows Delete to owners", () => {
    renderForm(true);
    expect(
      screen.getByRole("button", {
        name: englishMessages.vehicles.edit.delete.button,
      }),
    ).toBeInTheDocument();
  });
});
