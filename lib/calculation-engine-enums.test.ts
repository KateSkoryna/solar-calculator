import {
  EngineType,
  ParkingType,
  SolarPanelPlacement,
  VehicleType,
} from "@/app/generated/prisma/enums";
import {
  ENGINE_TYPES,
  PANEL_PLACEMENTS,
  PARKING_TYPES,
  VEHICLE_TYPES,
} from "@/lib/calculation-engine";

describe("calculation engine enums", () => {
  it("match the Prisma enums", () => {
    expect([...VEHICLE_TYPES].sort()).toEqual(
      Object.values(VehicleType).sort(),
    );
    expect([...ENGINE_TYPES].sort()).toEqual(Object.values(EngineType).sort());
    expect([...PARKING_TYPES].sort()).toEqual(
      Object.values(ParkingType).sort(),
    );
    expect([...PANEL_PLACEMENTS].sort()).toEqual(
      Object.values(SolarPanelPlacement).sort(),
    );
  });
});
