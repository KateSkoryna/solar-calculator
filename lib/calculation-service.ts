import type { Prisma, Vehicle } from "@/app/generated/prisma/client";
import {
  EU_COUNTRY_CODES,
  type EuCountryCode,
} from "@/lib/assumptions/eu-countries";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { CENTS_PER_EURO } from "@/lib/calculation-engine/constants";
import {
  calculate,
  SCENARIO_KINDS,
  type CalculationInput,
} from "@/lib/calculation-engine";
import { AuditAction, AuditEntityType, recordAuditEvent } from "@/lib/audit";

const COUNTRY_NAME_LOCALE = "en";
const RESULT_CURRENCY = "EUR";

export class UnsupportedVehicleCountryError extends Error {
  constructor(country: string) {
    super(`Unsupported vehicle country: ${country}`);
    this.name = "UnsupportedVehicleCountryError";
  }
}

const countryNames = new Intl.DisplayNames([COUNTRY_NAME_LOCALE], {
  type: "region",
});

function findCountryCode(country: string): EuCountryCode | undefined {
  const normalizedCountry = country.trim().toLowerCase();
  return EU_COUNTRY_CODES.find(
    (countryCode) =>
      countryCode.toLowerCase() === normalizedCountry ||
      countryNames.of(countryCode)?.toLowerCase() === normalizedCountry,
  );
}

export const CALCULATION_WITH_RESULTS_INCLUDE = {
  scenarios: { include: { result: true }, orderBy: { kind: "asc" } },
} as const satisfies Prisma.CalculationInclude;

export function centsToAmount(cents: number) {
  return (cents / CENTS_PER_EURO).toFixed(2);
}

export function toCalculationInput(vehicle: Vehicle): CalculationInput {
  const countryCode = findCountryCode(vehicle.country);
  if (!countryCode) throw new UnsupportedVehicleCountryError(vehicle.country);

  const capitalLocation =
    ASSUMPTION_SET_V1.countries[countryCode].capitalLocation;

  return {
    manufacturer: vehicle.manufacturer,
    model: vehicle.model,
    city: vehicle.city,
    vehicleType: vehicle.vehicleType,
    engineType: vehicle.engineType,
    parkingType: vehicle.parkingType,
    solarPanelPlacement: vehicle.solarPanelPlacement,
    cargoType: vehicle.cargoType,
    quantity: vehicle.quantity,
    averageDailyDistanceKm: vehicle.averageDailyDistanceKm,
    operatingMonthsPerYear: vehicle.operatingMonthsPerYear,
    winterUsage: vehicle.winterUsage,
    countryCode,
    latitude: vehicle.latitude ?? capitalLocation.latitude,
    longitude: vehicle.longitude ?? capitalLocation.longitude,
    energyConsumptionKwhPer100km: vehicle.energyConsumptionKwhPer100km,
    solarPanelCapacityKw: vehicle.solarPanelCapacityKw,
    payloadReserveKg: vehicle.payloadReserveKg,
    maxRoofLoadKg: vehicle.maxRoofLoadKg,
    coolingUnitType: vehicle.coolingUnitType ?? undefined,
    idleHoursPerDay: vehicle.idleHoursPerDay,
  };
}

interface CreateCalculationForVehicleParams {
  fleetId: string;
  vehicle: Vehicle;
  requestedByUserId: string;
  notes?: string;
}

export async function createCalculationForVehicle(
  transaction: Prisma.TransactionClient,
  {
    fleetId,
    vehicle,
    requestedByUserId,
    notes,
  }: CreateCalculationForVehicleParams,
) {
  const input = toCalculationInput(vehicle);
  const output = calculate(input, ASSUMPTION_SET_V1);

  const calculation = await transaction.calculation.create({
    data: { fleetId, vehicleId: vehicle.id, requestedByUserId, notes },
  });

  for (const kind of SCENARIO_KINDS) {
    const scenarioResult = output.scenarios[kind];

    await transaction.calculationScenario.create({
      data: {
        calculationId: calculation.id,
        kind,
        label: kind,
        formulaVersion: output.formulaVersion,
        assumptionSetVersion: output.assumptionSetVersion,
        inputSnapshot: {
          create: {
            vehicleSpec: {
              input: scenarioResult.resolvedInput,
              inputSources: output.inputSources,
            } as unknown as Prisma.InputJsonValue,
            energyPriceAssumptionVersion: output.assumptionSetVersion,
            emissionsFactorVersion: output.assumptionSetVersion,
            solarYieldAssumptionVersion: output.assumptionSetVersion,
            currencyConversionSourceVersion: output.assumptionSetVersion,
          },
        },
        result: {
          create: {
            paybackPeriodMonths: scenarioResult.paybackMonths,
            totalSolarYieldKwh: scenarioResult.yearlySolarEnergyKwh,
            co2SavedKg: scenarioResult.co2AvoidedKgPerYear,
            netSavingsAmount: centsToAmount(scenarioResult.tenYearNetGainCents),
            annualSavingsAmount: centsToAmount(
              scenarioResult.annualSavingsCents,
            ),
            oneTimeCostAmount: centsToAmount(
              scenarioResult.oneTimeCostAfterSubsidyCents,
            ),
            subsidyAmount: centsToAmount(scenarioResult.subsidyCents),
            savingsBreakdown: scenarioResult.savingsByTypeCents,
            cumulativeSavingsSeries:
              scenarioResult.cumulativeSavingsSeriesCents,
            currency: RESULT_CURRENCY,
          },
        },
      },
    });
  }

  await recordAuditEvent(transaction, {
    fleetId,
    actorUserId: requestedByUserId,
    action: AuditAction.CALCULATION_CREATED,
    entityType: AuditEntityType.CALCULATION,
    entityId: calculation.id,
    metadata: { vehicleId: vehicle.id },
  });

  return transaction.calculation.findUniqueOrThrow({
    where: { id: calculation.id },
    include: CALCULATION_WITH_RESULTS_INCLUDE,
  });
}
