import type { Prisma } from "@/app/generated/prisma/client";
import { EngineType } from "@/app/generated/prisma/enums";
import type { AssumptionSet } from "@/lib/assumptions/v1";
import type { CalculationInput } from "@/lib/calculation-engine";
import { scenarioValue } from "@/lib/calculation-engine/scenario-values";
import {
  quickCheckSchema,
  type QuickCheckAnswers,
} from "@/lib/quick-check-schema";

const QUICK_CHECK_ENGINE_TYPE = EngineType.DIESEL;
export const QUICK_CHECK_VEHICLE_MANUFACTURER = "Quick check";
const DEFAULT_OPERATING_MONTHS_PER_YEAR = 12;
const DEFAULT_WINTER_USAGE = true;
const CHILLED_CARGO_TYPE = "CHILLED";

export class InvalidQuickCheckError extends Error {
  constructor() {
    super("Invalid quick check");
    this.name = "InvalidQuickCheckError";
  }
}

function resolveDailyDistanceKm(
  answers: QuickCheckAnswers,
  assumptionSet: AssumptionSet,
) {
  return (
    answers.averageDailyDistanceKm ??
    scenarioValue(
      assumptionSet.distanceBands[answers.distanceBand],
      "REALISTIC",
    )
  );
}

function resolveIdleHoursPerDay(
  answers: QuickCheckAnswers,
  assumptionSet: AssumptionSet,
) {
  return (
    answers.idleHoursPerDay ??
    scenarioValue(
      assumptionSet.idling.hoursPerDay[answers.idlingFrequency],
      "REALISTIC",
    )
  );
}

function resolveCoolingUnitType(answers: QuickCheckAnswers) {
  return answers.cargoType === CHILLED_CARGO_TYPE
    ? answers.coolingUnitType
    : undefined;
}

export function quickCheckToCalculationInput(
  answers: QuickCheckAnswers,
  assumptionSet: AssumptionSet,
): CalculationInput {
  return {
    city: answers.cityLabel,
    vehicleType: answers.vehicleType,
    engineType: QUICK_CHECK_ENGINE_TYPE,
    parkingType: answers.parkingType,
    solarPanelPlacement: answers.solarPanelPlacement,
    cargoType: answers.cargoType,
    quantity: answers.quantity,
    averageDailyDistanceKm: resolveDailyDistanceKm(answers, assumptionSet),
    operatingMonthsPerYear:
      answers.operatingMonthsPerYear ?? DEFAULT_OPERATING_MONTHS_PER_YEAR,
    winterUsage: DEFAULT_WINTER_USAGE,
    countryCode: answers.countryCode,
    latitude: answers.latitude,
    longitude: answers.longitude,
    idleHoursPerDay: resolveIdleHoursPerDay(answers, assumptionSet),
    energyConsumptionKwhPer100km: answers.energyConsumptionKwhPer100km,
    solarPanelCapacityKw: answers.solarPanelCapacityKw,
    payloadReserveKg: answers.payloadReserveKg,
    maxRoofLoadKg: answers.maxRoofLoadKg,
    coolingUnitType: resolveCoolingUnitType(answers),
  };
}

export function quickCheckToVehicleData(
  answers: QuickCheckAnswers,
  assumptionSet: AssumptionSet,
): Omit<Prisma.VehicleUncheckedCreateInput, "fleetId"> {
  const vehicleAssumptions = assumptionSet.vehicleTypes[answers.vehicleType];

  return {
    manufacturer: QUICK_CHECK_VEHICLE_MANUFACTURER,
    model: answers.vehicleType,
    vehicleType: answers.vehicleType,
    engineType: QUICK_CHECK_ENGINE_TYPE,
    parkingType: answers.parkingType,
    quantity: answers.quantity,
    averageDailyDistanceKm: resolveDailyDistanceKm(answers, assumptionSet),
    energyConsumptionKwhPer100km:
      answers.energyConsumptionKwhPer100km ??
      scenarioValue(vehicleAssumptions.energyUsePer100km, "REALISTIC"),
    solarPanelCapacityKw:
      answers.solarPanelCapacityKw ??
      scenarioValue(
        vehicleAssumptions.usablePanelCapacityKw[answers.solarPanelPlacement],
        "REALISTIC",
      ),
    solarPanelPlacement: answers.solarPanelPlacement,
    payloadReserveKg:
      answers.payloadReserveKg ??
      scenarioValue(vehicleAssumptions.payloadReserveKg, "REALISTIC"),
    maxRoofLoadKg:
      answers.maxRoofLoadKg ??
      scenarioValue(vehicleAssumptions.maxRoofLoadKg, "REALISTIC"),
    operatingMonthsPerYear:
      answers.operatingMonthsPerYear ?? DEFAULT_OPERATING_MONTHS_PER_YEAR,
    winterUsage: DEFAULT_WINTER_USAGE,
    city: answers.cityLabel,
    country: answers.countryCode,
    cargoType: answers.cargoType,
    idleHoursPerDay: resolveIdleHoursPerDay(answers, assumptionSet),
    coolingUnitType: resolveCoolingUnitType(answers),
    latitude: answers.latitude,
    longitude: answers.longitude,
  };
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(encoded: string) {
  const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function encodeQuickCheck(answers: QuickCheckAnswers) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(answers)));
}

export function decodeQuickCheck(encoded: string): QuickCheckAnswers {
  try {
    const json = new TextDecoder("utf-8", { fatal: true }).decode(
      base64UrlToBytes(encoded),
    );
    return quickCheckSchema.parse(JSON.parse(json));
  } catch {
    throw new InvalidQuickCheckError();
  }
}
