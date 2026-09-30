import type { AssumptionSet } from "@/lib/assumptions/v1";
import { resolveInputSources } from "@/lib/calculation-engine/resolve-inputs";
import { calculateScenario } from "@/lib/calculation-engine/scenario";
import {
  SCENARIO_KINDS,
  type CalculationInput,
  type CalculationOutput,
  type ScenarioResult,
} from "@/lib/calculation-engine/types";
import { assertValidInput } from "@/lib/calculation-engine/validate-input";

export const FORMULA_VERSION = "1.0.0";

export function calculate(
  input: CalculationInput,
  assumptionSet: AssumptionSet,
): CalculationOutput {
  assertValidInput(input);

  const scenarios = Object.fromEntries(
    SCENARIO_KINDS.map((scenario) => [
      scenario,
      calculateScenario(input, assumptionSet, scenario),
    ]),
  ) as Record<(typeof SCENARIO_KINDS)[number], ScenarioResult>;

  return {
    formulaVersion: FORMULA_VERSION,
    assumptionSetVersion: assumptionSet.version,
    inputSources: resolveInputSources(input),
    scenarios,
  };
}

export * from "@/lib/calculation-engine/types";
