import {
  CargoType,
  CoolingUnitType,
  EngineType,
  ParkingType,
  ScenarioKind,
  SolarPanelPlacement,
  VehicleType,
} from "@/app/generated/prisma/enums";
import { COOLING_UNIT_TYPES } from "@/lib/assumptions/types";
import {
  CARGO_TYPES,
  ENGINE_TYPES,
  PANEL_PLACEMENTS,
  PARKING_TYPES,
  SCENARIO_KINDS,
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
    expect([...SCENARIO_KINDS].sort()).toEqual(
      Object.values(ScenarioKind).sort(),
    );
    expect([...CARGO_TYPES].sort()).toEqual(Object.values(CargoType).sort());
    expect([...COOLING_UNIT_TYPES].sort()).toEqual(
      Object.values(CoolingUnitType).sort(),
    );
  });
});
