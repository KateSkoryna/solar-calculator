import { z } from "zod";
import {
  CargoType,
  ParkingType,
  SolarPanelPlacement,
  VehicleType,
} from "@/app/generated/prisma/enums";
import { EU_COUNTRY_CODES } from "@/lib/assumptions/eu-countries";
import {
  COOLING_UNIT_TYPES,
  DISTANCE_BANDS,
  IDLING_FREQUENCIES,
} from "@/lib/assumptions/types";
import type { InputSources } from "@/lib/calculation-engine/types";
import {
  quickCheckSchema,
  type QuickCheckAnswers,
} from "@/lib/quick-check-schema";

export const CALCULATOR_STEP_KEYS = [
  "vehicles",
  "dailyDriving",
  "location",
  "panels",
] as const;

export type CalculatorStepKey = (typeof CALCULATOR_STEP_KEYS)[number];

export const UNSURE_COOLING_UNIT = "NOT_SURE";
export const COOLING_UNIT_CHOICES = [
  ...COOLING_UNIT_TYPES,
  UNSURE_COOLING_UNIT,
] as const;

export const CHILLED_CARGO_TYPE: CargoType = "CHILLED";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 999;
const MAX_HOURS_PER_DAY = 24;
const MIN_OPERATING_MONTHS = 1;
const MAX_OPERATING_MONTHS = 12;

const citySchema = z.object({
  label: z.string().min(1),
  countryCode: z.enum(EU_COUNTRY_CODES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type CalculatorCity = z.infer<typeof citySchema>;

export const calculatorFormSchema = z.object({
  vehicleType: z.enum(Object.values(VehicleType)),
  quantity: z.number().int().min(MIN_QUANTITY).max(MAX_QUANTITY),
  cargoType: z.enum(Object.values(CargoType)),
  distanceBand: z.enum(DISTANCE_BANDS),
  idlingFrequency: z.enum(IDLING_FREQUENCIES),
  city: citySchema.nullable(),
  parkingType: z.enum(Object.values(ParkingType)),
  solarPanelPlacement: z.enum(Object.values(SolarPanelPlacement)),
  coolingUnitType: z.enum(COOLING_UNIT_CHOICES),
  averageDailyDistanceKm: z.number().positive().optional(),
  idleHoursPerDay: z.number().min(0).max(MAX_HOURS_PER_DAY).optional(),
  energyConsumptionKwhPer100km: z.number().positive().optional(),
  operatingMonthsPerYear: z
    .number()
    .int()
    .min(MIN_OPERATING_MONTHS)
    .max(MAX_OPERATING_MONTHS)
    .optional(),
  solarPanelCapacityKw: z.number().nonnegative().optional(),
  maxRoofLoadKg: z.number().nonnegative().optional(),
  payloadReserveKg: z.number().nonnegative().optional(),
});

export type CalculatorFormValues = z.infer<typeof calculatorFormSchema>;

export const OPTIONAL_NUMBER_FIELDS = [
  "averageDailyDistanceKm",
  "idleHoursPerDay",
  "energyConsumptionKwhPer100km",
  "operatingMonthsPerYear",
  "solarPanelCapacityKw",
  "maxRoofLoadKg",
  "payloadReserveKg",
] as const;

export type OptionalNumberField = (typeof OPTIONAL_NUMBER_FIELDS)[number];

const CHOICE_FIELDS = [
  "vehicleType",
  "quantity",
  "cargoType",
  "distanceBand",
  "idlingFrequency",
  "parkingType",
  "solarPanelPlacement",
] as const;

export const CALCULATOR_DEFAULT_VALUES: CalculatorFormValues = {
  vehicleType: "VAN",
  quantity: MIN_QUANTITY,
  cargoType: "REGULAR",
  distanceBand: "REGIONAL",
  idlingFrequency: "RARELY",
  city: null,
  parkingType: "DEPOT",
  solarPanelPlacement: "ROOF",
  coolingUnitType: UNSURE_COOLING_UNIT,
};

export const CALCULATOR_STEP_FIELDS: Record<
  CalculatorStepKey,
  (keyof CalculatorFormValues)[]
> = {
  vehicles: ["vehicleType", "quantity", "cargoType"],
  dailyDriving: [
    "distanceBand",
    "idlingFrequency",
    "averageDailyDistanceKm",
    "idleHoursPerDay",
    "energyConsumptionKwhPer100km",
    "operatingMonthsPerYear",
    "coolingUnitType",
  ],
  location: ["city", "parkingType"],
  panels: [
    "solarPanelPlacement",
    "solarPanelCapacityKw",
    "maxRoofLoadKg",
    "payloadReserveKg",
  ],
};

export function isChilledCargo(
  values: Pick<CalculatorFormValues, "cargoType">,
) {
  return values.cargoType === CHILLED_CARGO_TYPE;
}

export function toQuickCheckAnswers(
  values: CalculatorFormValues,
): QuickCheckAnswers | null {
  if (values.city === null) return null;

  const { city, coolingUnitType, ...answeredValues } = values;
  const knownCoolingUnit =
    isChilledCargo(values) && coolingUnitType !== UNSURE_COOLING_UNIT
      ? { coolingUnitType }
      : {};
  const parsedAnswers = quickCheckSchema.safeParse({
    ...answeredValues,
    ...knownCoolingUnit,
    cityLabel: city.label,
    countryCode: city.countryCode,
    latitude: city.latitude,
    longitude: city.longitude,
  });

  return parsedAnswers.success ? parsedAnswers.data : null;
}

export function calculatorInputSources(
  values: CalculatorFormValues,
): InputSources {
  const answeredSource = (isAnswered: boolean) =>
    isAnswered ? "PROVIDED" : "PRESET";
  const sources: Record<string, "PROVIDED" | "PRESET"> = {};

  CHOICE_FIELDS.forEach((field) => {
    sources[field] = "PROVIDED";
  });
  sources.city = answeredSource(values.city !== null);
  OPTIONAL_NUMBER_FIELDS.forEach((field) => {
    sources[field] = answeredSource(values[field] !== undefined);
  });
  if (isChilledCargo(values)) {
    sources.coolingUnitType = answeredSource(
      values.coolingUnitType !== UNSURE_COOLING_UNIT,
    );
  }

  return sources;
}
