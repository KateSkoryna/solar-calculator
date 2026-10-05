import { z } from "zod";
import {
  CENTS_PER_EURO,
  SERIES_YEARS,
} from "@/lib/calculation-engine/constants";
import {
  SAVINGS_TYPES,
  SCENARIO_KINDS,
  type InputSources,
  type ResolvedInput,
  type ScenarioKind,
} from "@/lib/calculation-engine/types";

type StoredAmount = { toString(): string } | number | string;

export interface StoredInputSnapshot {
  vehicleSpec: unknown;
  capturedAt: Date;
  energyPriceAssumptionVersion: string;
  emissionsFactorVersion: string;
  solarYieldAssumptionVersion: string;
  currencyConversionSourceVersion: string;
}

export interface StoredResult {
  paybackPeriodMonths: number | null;
  co2SavedKg: number;
  netSavingsAmount: StoredAmount;
  annualSavingsAmount: StoredAmount;
  oneTimeCostAmount: StoredAmount;
  savingsBreakdown: unknown;
  cumulativeSavingsSeries: unknown;
  computedAt: Date;
}

export interface StoredScenario {
  kind: ScenarioKind;
  formulaVersion: string;
  assumptionSetVersion: string;
  inputSnapshot: StoredInputSnapshot | null;
  result: StoredResult | null;
}

export interface StoredCalculation {
  requestedByUser: { name: string | null; email: string };
  scenarios: StoredScenario[];
}

export interface CompleteStoredScenario {
  formulaVersion: string;
  assumptionSetVersion: string;
  inputSnapshot: StoredInputSnapshot;
  result: StoredResult;
}

export interface ProvenanceDetails {
  requestedBy: string;
  calculatedAt: Date;
  inputsSavedAt: Date;
  energyPriceVersion: string;
  emissionsFactorVersion: string;
  solarYieldVersion: string;
  currencyConversionVersion: string;
}

export class IncompleteStoredCalculationError extends Error {
  constructor(reason: string) {
    super(`Incomplete stored calculation: ${reason}`);
    this.name = "IncompleteStoredCalculationError";
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const vehicleSpecSchema = z.object({
  input: z.custom<ResolvedInput>(isPlainObject),
  inputSources: z.custom<InputSources>(isPlainObject),
});

const savingsBreakdownSchema = z.record(z.enum(SAVINGS_TYPES), z.number());

const cumulativeSeriesSchema = z.array(z.number()).length(SERIES_YEARS + 1);

export function amountToCents(amount: StoredAmount) {
  return Math.round(Number(amount.toString()) * CENTS_PER_EURO);
}

export function parseStoredVehicleSpec(vehicleSpec: unknown) {
  const parsed = vehicleSpecSchema.safeParse(vehicleSpec);
  if (!parsed.success) {
    throw new IncompleteStoredCalculationError("unreadable input snapshot");
  }
  return parsed.data;
}

export function parseStoredSavingsBreakdown(savingsBreakdown: unknown) {
  const parsed = savingsBreakdownSchema.safeParse(savingsBreakdown);
  if (!parsed.success) {
    throw new IncompleteStoredCalculationError("unreadable savings breakdown");
  }
  return parsed.data;
}

export function parseStoredCumulativeSeries(series: unknown) {
  const parsed = cumulativeSeriesSchema.safeParse(series);
  if (!parsed.success) {
    throw new IncompleteStoredCalculationError("unreadable savings series");
  }
  return parsed.data;
}

export function requireCompleteScenarios(
  calculation: StoredCalculation,
): Record<ScenarioKind, CompleteStoredScenario> {
  const entries = SCENARIO_KINDS.map((kind) => {
    const scenario = calculation.scenarios.find(
      (candidate) => candidate.kind === kind,
    );
    if (!scenario?.inputSnapshot || !scenario.result) {
      throw new IncompleteStoredCalculationError(`missing ${kind} scenario`);
    }
    return [
      kind,
      {
        formulaVersion: scenario.formulaVersion,
        assumptionSetVersion: scenario.assumptionSetVersion,
        inputSnapshot: scenario.inputSnapshot,
        result: scenario.result,
      },
    ] as const;
  });

  return Object.fromEntries(entries) as Record<
    ScenarioKind,
    CompleteStoredScenario
  >;
}

export function toProvenanceDetails(
  calculation: StoredCalculation,
): ProvenanceDetails {
  const { inputSnapshot, result } =
    requireCompleteScenarios(calculation).REALISTIC;
  const { name, email } = calculation.requestedByUser;

  return {
    requestedBy: name ?? email,
    calculatedAt: result.computedAt,
    inputsSavedAt: inputSnapshot.capturedAt,
    energyPriceVersion: inputSnapshot.energyPriceAssumptionVersion,
    emissionsFactorVersion: inputSnapshot.emissionsFactorVersion,
    solarYieldVersion: inputSnapshot.solarYieldAssumptionVersion,
    currencyConversionVersion: inputSnapshot.currencyConversionSourceVersion,
  };
}
