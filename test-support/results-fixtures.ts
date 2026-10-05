import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import {
  calculate,
  type CalculationInput,
  type CalculationOutput,
  type ScenarioKind,
} from "@/lib/calculation-engine";
import { BASE_INPUT } from "@/lib/calculation-engine/test-fixtures";

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
