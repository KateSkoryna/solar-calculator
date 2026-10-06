import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VehicleEditForm from "./VehicleEditForm";
import {
  NO_COOLING_UNIT,
  type VehicleEditFormValues,
} from "@/lib/vehicle-edit-form";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: jest.fn() }),
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

  it("keeps both save buttons inactive until something changes", async () => {
    renderForm(false);
    const messages = englishMessages.vehicles.edit;
    const saveButton = screen.getByRole("button", { name: messages.save });
    const recalculateButton = screen.getByRole("button", {
      name: messages.saveAndRecalculate,
    });

    expect(saveButton).toBeDisabled();
    expect(recalculateButton).toBeDisabled();

    const quantity = screen.getByLabelText(messages.fields.quantity);
    await userEvent.clear(quantity);
    await userEvent.type(quantity, "5");

    expect(saveButton).toBeEnabled();
    expect(recalculateButton).toBeEnabled();
  });

  it("tells the user when a value is invalid instead of doing nothing", async () => {
    global.fetch = jest.fn();
    renderForm(false);
    const messages = englishMessages.vehicles.edit;

    const quantity = screen.getByLabelText(messages.fields.quantity);
    await userEvent.clear(quantity);
    await userEvent.type(quantity, "0");
    await userEvent.click(
      screen.getByRole("button", { name: messages.saveAndRecalculate }),
    );

    expect(await screen.findByText(messages.invalidFields)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
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

  it("saves the changes and recalculates, then opens the new result", async () => {
    pushMock.mockReset();
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ calculation: { id: "calc_new" } }),
      });
    global.fetch = fetchMock;
    renderForm(false);

    const quantity = screen.getByLabelText(
      englishMessages.vehicles.edit.fields.quantity,
    );
    await userEvent.clear(quantity);
    await userEvent.type(quantity, "5");
    await userEvent.click(
      screen.getByRole("button", {
        name: englishMessages.vehicles.edit.saveAndRecalculate,
      }),
    );

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/en/berlin/calculations/calc_new"),
    );
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/fleets/fleet_1/vehicles/vehicle_1",
    );
    expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      quantity: 5,
    });
    expect(fetchMock.mock.calls[1][0]).toBe("/api/fleets/fleet_1/calculations");
  });

  it("only saves, without calculating, with the plain save button", async () => {
    pushMock.mockReset();
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    global.fetch = fetchMock;
    renderForm(false);

    const quantity = screen.getByLabelText(
      englishMessages.vehicles.edit.fields.quantity,
    );
    await userEvent.clear(quantity);
    await userEvent.type(quantity, "5");
    await userEvent.click(
      screen.getByRole("button", { name: englishMessages.vehicles.edit.save }),
    );

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/en/berlin/vehicles"),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
