import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import {
  calculate,
  type CalculationInput,
  type CalculationOutput,
  type ScenarioKind,
} from "@/lib/calculation-engine";
import { CENTS_PER_EURO } from "@/lib/calculation-engine/constants";
import { BASE_INPUT } from "@/lib/calculation-engine/test-fixtures";
import type {
  StoredCalculation,
  StoredScenario,
} from "@/lib/stored-calculation";

type PaybackMonthsByScenario = Record<ScenarioKind, number | null>;

export function calculateOutput(
  inputOverrides: Partial<CalculationInput> = {},
): CalculationOutput {
  return calculate({ ...BASE_INPUT, ...inputOverrides }, ASSUMPTION_SET_V1);
}

export function withPaybackMonths(
  output: CalculationOutput,
  paybackMonths: PaybackMonthsByScenario,
): CalculationOutput {
  return {
    ...output,
    scenarios: {
      PESSIMISTIC: {
        ...output.scenarios.PESSIMISTIC,
        paybackMonths: paybackMonths.PESSIMISTIC,
      },
      REALISTIC: {
        ...output.scenarios.REALISTIC,
        paybackMonths: paybackMonths.REALISTIC,
      },
      OPTIMISTIC: {
        ...output.scenarios.OPTIMISTIC,
        paybackMonths: paybackMonths.OPTIMISTIC,
      },
    },
  };
}

export function outputWithRealisticPayback(realisticMonths: number | null) {
  return withPaybackMonths(calculateOutput(), {
    PESSIMISTIC: realisticMonths,
    REALISTIC: realisticMonths,
    OPTIMISTIC: realisticMonths,
  });
}

const STORED_CURRENCY_DIGITS = 2;
const STORED_CAPTURED_AT = new Date("2026-09-29T08:00:00Z");
const STORED_COMPUTED_AT = new Date("2026-09-29T08:00:05Z");

function toStoredAmount(cents: number) {
  return (cents / CENTS_PER_EURO).toFixed(STORED_CURRENCY_DIGITS);
}

function withReversedKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withReversedKeys);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, entry]) => [key, withReversedKeys(entry)]),
  );
}

export function toStoredCalculation(
  output: CalculationOutput,
): StoredCalculation {
  const scenarios = Object.values(output.scenarios).map(
    (scenario): StoredScenario => ({
      kind: scenario.kind,
      formulaVersion: output.formulaVersion,
      assumptionSetVersion: output.assumptionSetVersion,
      inputSnapshot: {
        vehicleSpec: withReversedKeys(
          JSON.parse(
            JSON.stringify({
              input: scenario.resolvedInput,
              inputSources: output.inputSources,
            }),
          ),
        ),
        capturedAt: STORED_CAPTURED_AT,
        energyPriceAssumptionVersion: output.assumptionSetVersion,
        emissionsFactorVersion: output.assumptionSetVersion,
        solarYieldAssumptionVersion: output.assumptionSetVersion,
        currencyConversionSourceVersion: output.assumptionSetVersion,
      },
      result: {
        paybackPeriodMonths: scenario.paybackMonths,
        co2SavedKg: scenario.co2AvoidedKgPerYear,
        netSavingsAmount: toStoredAmount(scenario.tenYearNetGainCents),
        annualSavingsAmount: toStoredAmount(scenario.annualSavingsCents),
        oneTimeCostAmount: toStoredAmount(
          scenario.oneTimeCostAfterSubsidyCents,
        ),
        savingsBreakdown: scenario.savingsByTypeCents,
        cumulativeSavingsSeries: scenario.cumulativeSavingsSeriesCents,
        computedAt: STORED_COMPUTED_AT,
      },
    }),
  );

  return {
    requestedByUser: { name: "Mira Hoffmann", email: "mira@example.com" },
    scenarios,
  };
}
