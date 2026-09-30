import { NO_SAVINGS } from "@/lib/calculation-engine/constants";
import type {
  SavingsContext,
  SavingsOutcome,
} from "@/lib/calculation-engine/types";
import { operatingDaysPerYear } from "@/lib/calculation-engine/energy";
import { scenarioValue } from "@/lib/calculation-engine/scenario-values";
import {
  fuelOfEngine,
  outcomeForFuel,
} from "@/lib/calculation-engine/savings/fuel";

export function lessIdlingSavings(
  allocatedKwh: number,
  demandKwh: number,
  { assumptionSet, input, scenario, prices }: SavingsContext,
): SavingsOutcome {
  if (input.idleHoursPerDay <= 0 || demandKwh <= 0 || allocatedKwh <= 0) {
    return NO_SAVINGS;
  }

  const engineFuel = fuelOfEngine(input.engineType);

  if (engineFuel === "grid") {
    return outcomeForFuel("grid", allocatedKwh, prices);
  }

  const shareOfIdlingAvoided = allocatedKwh / demandKwh;
  const idleFuelPerYear =
    input.idleHoursPerDay *
    operatingDaysPerYear(input) *
    scenarioValue(assumptionSet.idling.fuelPerIdleHour, scenario);

  return outcomeForFuel(
    engineFuel,
    shareOfIdlingAvoided * idleFuelPerYear,
    prices,
  );
}
