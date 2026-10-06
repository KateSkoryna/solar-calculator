import {
  NO_COOLING_UNIT,
  toVehicleUpdate,
  vehicleEditFormSchema,
  type VehicleEditFormValues,
} from "@/lib/vehicle-edit-form";

const original: VehicleEditFormValues = {
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

describe("toVehicleUpdate", () => {
  it("sends nothing when nothing changed", () => {
    expect(toVehicleUpdate(original, original)).toEqual({});
  });

  it("sends only the changed fields", () => {
    expect(toVehicleUpdate({ ...original, quantity: 5 }, original)).toEqual({
      quantity: 5,
    });
  });

  it("clears the coordinates when the location changes", () => {
    expect(toVehicleUpdate({ ...original, city: "Hamburg" }, original)).toEqual(
      { city: "Hamburg", latitude: null, longitude: null },
    );
  });

  it("sends a cooling unit only for chilled cargo", () => {
    const chilled = {
      ...original,
      cargoType: "CHILLED" as const,
      coolingUnitType: "ELECTRIC" as const,
    };

    expect(toVehicleUpdate(chilled, original)).toEqual({
      cargoType: "CHILLED",
      coolingUnitType: "ELECTRIC",
    });
    expect(
      toVehicleUpdate({ ...chilled, cargoType: "REGULAR" }, original),
    ).toEqual({});
  });
});

describe("vehicleEditFormSchema", () => {
  it("accepts the original values", () => {
    expect(vehicleEditFormSchema.safeParse(original).success).toBe(true);
  });

  it("rejects a non-positive quantity", () => {
    expect(
      vehicleEditFormSchema.safeParse({ ...original, quantity: 0 }).success,
    ).toBe(false);
  });
});
