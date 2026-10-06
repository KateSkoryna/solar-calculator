import { z } from "zod";
import { COOLING_UNIT_TYPES } from "@/lib/assumptions/types";
import { CHILLED_CARGO_TYPE } from "@/lib/calculator-form";
import { vehicleInputSchema } from "@/lib/vehicle-schema";

export const NO_COOLING_UNIT = "";

export const vehicleEditFormSchema = vehicleInputSchema
  .omit({ coolingUnitType: true, latitude: true, longitude: true })
  .extend({
    cargoType: vehicleInputSchema.shape.cargoType.unwrap(),
    idleHoursPerDay: vehicleInputSchema.shape.idleHoursPerDay.unwrap(),
    coolingUnitType: z.enum([...COOLING_UNIT_TYPES, NO_COOLING_UNIT]),
  });

export type VehicleEditFormValues = z.infer<typeof vehicleEditFormSchema>;

export const VEHICLE_TEXT_FIELDS = ["manufacturer", "model", "city"] as const;

export const VEHICLE_NUMBER_FIELDS = [
  "quantity",
  "averageDailyDistanceKm",
  "energyConsumptionKwhPer100km",
  "idleHoursPerDay",
  "operatingMonthsPerYear",
  "solarPanelCapacityKw",
  "payloadReserveKg",
  "maxRoofLoadKg",
] as const;

export const VEHICLE_CHOICE_FIELDS = [
  "vehicleType",
  "engineType",
  "cargoType",
  "parkingType",
  "solarPanelPlacement",
] as const;

export type VehicleNumberField = (typeof VEHICLE_NUMBER_FIELDS)[number];
export type VehicleChoiceField = (typeof VEHICLE_CHOICE_FIELDS)[number];

export const VEHICLE_FORM_GROUPS = [
  {
    key: "vehicle",
    fields: [
      "manufacturer",
      "model",
      "vehicleType",
      "engineType",
      "quantity",
      "cargoType",
    ],
  },
  {
    key: "driving",
    fields: [
      "averageDailyDistanceKm",
      "energyConsumptionKwhPer100km",
      "idleHoursPerDay",
      "operatingMonthsPerYear",
      "winterUsage",
    ],
  },
  { key: "location", fields: ["city", "country", "parkingType"] },
  {
    key: "panels",
    fields: [
      "solarPanelPlacement",
      "solarPanelCapacityKw",
      "payloadReserveKg",
      "maxRoofLoadKg",
    ],
  },
] as const;

export function isChilledVehicle({
  cargoType,
}: Pick<VehicleEditFormValues, "cargoType">) {
  return cargoType === CHILLED_CARGO_TYPE;
}

export function toVehicleUpdate(
  values: VehicleEditFormValues,
  original: VehicleEditFormValues,
) {
  const { coolingUnitType, ...rest } = values;
  const isChilled = isChilledVehicle(values);
  const resolvedCooling =
    isChilled && coolingUnitType !== NO_COOLING_UNIT ? coolingUnitType : null;
  const originalCooling =
    original.coolingUnitType === NO_COOLING_UNIT
      ? null
      : original.coolingUnitType;
  const locationChanged =
    values.city !== original.city || values.country !== original.country;

  const changedFields = Object.fromEntries(
    Object.entries(rest).filter(
      ([field, value]) =>
        value !== original[field as keyof VehicleEditFormValues],
    ),
  );

  return {
    ...changedFields,
    ...(resolvedCooling !== originalCooling
      ? { coolingUnitType: resolvedCooling }
      : {}),
    ...(locationChanged ? { latitude: null, longitude: null } : {}),
  };
}
