import { NO_SAVINGS } from "@/lib/calculation-engine/constants";
import type {
  SavingsContext,
  SavingsOutcome,
} from "@/lib/calculation-engine/types";
import { scenarioValue } from "@/lib/calculation-engine/scenario-values";
import {
  fuelOfEngine,
  outcomeForFuel,
} from "@/lib/calculation-engine/savings/fuel";

export function alternatorFuelSavings(
  allocatedKwh: number,
  { assumptionSet, input, scenario, prices }: SavingsContext,
): SavingsOutcome {
  const fuel = fuelOfEngine(input.engineType);

  if (allocatedKwh <= 0 || (fuel !== "diesel" && fuel !== "petrol")) {
    return NO_SAVINGS;
  }

  const { alternator } = assumptionSet;
  const fuelPerKwh = scenarioValue(
    fuel === "diesel"
      ? alternator.dieselFuelPerKwh
      : alternator.petrolFuelPerKwh,
    scenario,
  );

  return outcomeForFuel(fuel, allocatedKwh * fuelPerKwh, prices);
}
