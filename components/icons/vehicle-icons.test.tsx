import { render } from "@testing-library/react";
import { VEHICLE_ICONS } from "./vehicle-icons";
import { VehicleType } from "@/app/generated/prisma/enums";

describe("VEHICLE_ICONS", () => {
  it.each(Object.values(VehicleType))("draws an icon for %s", (vehicleType) => {
    const VehicleIcon = VEHICLE_ICONS[vehicleType];
    const { container } = render(<VehicleIcon aria-hidden="true" />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
