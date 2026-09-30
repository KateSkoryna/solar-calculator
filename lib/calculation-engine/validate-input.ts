import { EU_COUNTRY_CODES } from "@/lib/assumptions/eu-countries";
import { MONTHS_PER_YEAR } from "@/lib/calculation-engine/constants";
import type { CalculationInput } from "@/lib/calculation-engine/types";

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const MAX_IDLE_HOURS_PER_DAY = 24;

function assertNumberInRange(
  name: string,
  value: number | undefined,
  minimum: number,
  maximum: number,
) {
  if (value === undefined) return;

  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be between ${minimum} and ${maximum}`);
  }
}

function assertIntegerInRange(
  name: string,
  value: number,
  minimum: number,
  maximum: number,
) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `${name} must be a whole number between ${minimum} and ${maximum}`,
    );
  }
}

export function assertValidInput(input: CalculationInput): void {
  if (!EU_COUNTRY_CODES.includes(input.countryCode)) {
    throw new Error(`Unsupported country code: ${input.countryCode}`);
  }

  assertIntegerInRange("quantity", input.quantity, 1, Number.MAX_SAFE_INTEGER);
  assertIntegerInRange(
    "operatingMonthsPerYear",
    input.operatingMonthsPerYear,
    1,
    MONTHS_PER_YEAR,
  );
  assertNumberInRange("latitude", input.latitude, -MAX_LATITUDE, MAX_LATITUDE);
  assertNumberInRange(
    "longitude",
    input.longitude,
    -MAX_LONGITUDE,
    MAX_LONGITUDE,
  );
  assertNumberInRange(
    "idleHoursPerDay",
    input.idleHoursPerDay,
    0,
    MAX_IDLE_HOURS_PER_DAY,
  );

  const nonNegativeFields = [
    ["averageDailyDistanceKm", input.averageDailyDistanceKm],
    ["energyConsumptionKwhPer100km", input.energyConsumptionKwhPer100km],
    ["solarPanelCapacityKw", input.solarPanelCapacityKw],
    ["payloadReserveKg", input.payloadReserveKg],
    ["maxRoofLoadKg", input.maxRoofLoadKg],
    ["subsidyOverrideCents", input.subsidyOverrideCents],
  ] as const;

  for (const [name, value] of nonNegativeFields) {
    assertNumberInRange(name, value, 0, Number.MAX_VALUE);
  }
}
