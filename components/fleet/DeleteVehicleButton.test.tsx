import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteVehicleButton from "./DeleteVehicleButton";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const deleteMessages = englishMessages.vehicles.edit.delete;

function renderButton() {
  renderWithIntl(
    <DeleteVehicleButton
      fleetId="fleet_1"
      fleetSlug="berlin"
      vehicleId="vehicle_1"
      vehicleName="Berlin vans"
    />,
  );
}

beforeEach(() => {
  pushMock.mockReset();
  refreshMock.mockReset();
});

describe("DeleteVehicleButton", () => {
  it("does nothing until the confirmation is accepted", async () => {
    global.fetch = jest.fn();
    renderButton();

    await userEvent.click(
      screen.getByRole("button", { name: deleteMessages.button }),
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: deleteMessages.cancel }),
    );

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("deletes the vehicle after confirming and returns to the list", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    renderButton();

    await userEvent.click(
      screen.getByRole("button", { name: deleteMessages.button }),
    );
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: deleteMessages.confirm,
      }),
    );

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/en/berlin/vehicles"),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/fleets/fleet_1/vehicles/vehicle_1",
      { method: "DELETE" },
    );
  });

  it("shows an error and stays when deleting fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    renderButton();

    await userEvent.click(
      screen.getByRole("button", { name: deleteMessages.button }),
    );
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: deleteMessages.confirm,
      }),
    );

    expect(await screen.findByText(deleteMessages.failed)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
