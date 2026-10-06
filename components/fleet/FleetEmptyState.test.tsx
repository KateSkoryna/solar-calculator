import { screen } from "@testing-library/react";
import FleetEmptyState from "./FleetEmptyState";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const emptyMessages = englishMessages.overview.empty;
const NEW_VEHICLE_PATH = "/en/berlin/vehicles/new";

describe("FleetEmptyState", () => {
  it("tells an editor what to do and offers to add vehicles", () => {
    renderWithIntl(
      <FleetEmptyState canAddVehicles newVehiclePath={NEW_VEHICLE_PATH} />,
    );

    expect(screen.getByText(emptyMessages.textForEditors)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: englishMessages.overview.addVehicles }),
    ).toHaveAttribute("href", NEW_VEHICLE_PATH);
  });

  it("shows a viewer the sentence without an Add vehicles button", () => {
    renderWithIntl(
      <FleetEmptyState
        canAddVehicles={false}
        newVehiclePath={NEW_VEHICLE_PATH}
      />,
    );

    expect(screen.getByText(emptyMessages.textForViewers)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: englishMessages.overview.addVehicles,
      }),
    ).not.toBeInTheDocument();
  });
});
