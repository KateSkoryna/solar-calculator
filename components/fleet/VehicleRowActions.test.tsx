import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VehicleType } from "@/app/generated/prisma/enums";
import VehicleRowActions from "./VehicleRowActions";
import type { FleetVehicleGroup } from "@/lib/fleet-group-status";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const actionMessages = englishMessages.vehicles.actions;
const VEHICLE_NAME = "Ford Transit";

const group: FleetVehicleGroup = {
  vehicleId: "vehicle_1",
  manufacturer: "Ford",
  model: "Transit",
  vehicleType: VehicleType.VAN,
  city: "Berlin",
  quantity: 3,
  latestCalculation: null,
};

function renderActions(permissions: { canEdit: boolean; canDelete: boolean }) {
  return renderWithIntl(
    <VehicleRowActions
      group={group}
      fleetId="fleet_1"
      fleetSlug="berlin"
      {...permissions}
    />,
  );
}

beforeEach(() => {
  pushMock.mockReset();
  refreshMock.mockReset();
});

describe("VehicleRowActions", () => {
  it("shows viewers no edit, run or delete actions", () => {
    const { container } = renderActions({ canEdit: false, canDelete: false });

    expect(container).toBeEmptyDOMElement();
  });

  it("gives managers edit and run but not delete", () => {
    renderActions({ canEdit: true, canDelete: false });

    expect(
      screen.getByRole("link", {
        name: actionMessages.editLabel.replace("{vehicle}", VEHICLE_NAME),
      }),
    ).toHaveAttribute("href", "/en/berlin/vehicles/vehicle_1/edit");
    expect(
      screen.getByRole("button", { name: /Run calculation/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Delete/ }),
    ).not.toBeInTheDocument();
  });

  it("runs a calculation and opens its result", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ calculation: { id: "calc_9" } }),
    });
    renderActions({ canEdit: true, canDelete: true });

    await userEvent.click(
      screen.getByRole("button", { name: /Run calculation/ }),
    );

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/en/berlin/calculations/calc_9"),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/fleets/fleet_1/calculations",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ vehicleId: "vehicle_1" }),
      }),
    );
  });

  it("requires confirmation before deleting", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    renderActions({ canEdit: true, canDelete: true });

    await userEvent.click(screen.getByRole("button", { name: /^Delete/ }));
    expect(global.fetch).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: actionMessages.cancel }),
    );
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Delete/ }));
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: actionMessages.confirmDelete,
      }),
    );

    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/fleets/fleet_1/vehicles/vehicle_1",
      { method: "DELETE" },
    );
  });
});
