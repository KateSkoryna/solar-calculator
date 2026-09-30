import type { Assumption } from "@/lib/assumptions/types";
import type { ScenarioKind } from "@/lib/calculation-engine/types";

const SCENARIO_VALUE_KEY = {
  PESSIMISTIC: "pessimistic",
  REALISTIC: "realistic",
  OPTIMISTIC: "optimistic",
} as const satisfies Record<ScenarioKind, string>;

export function scenarioValue(
  assumption: Assumption,
  scenario: ScenarioKind,
): number {
  return assumption.value[SCENARIO_VALUE_KEY[scenario]];
}
