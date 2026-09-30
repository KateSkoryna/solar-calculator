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

export function coolingUnitFuelSavings(
  allocatedKwh: number,
  { assumptionSet, input, scenario, prices }: SavingsContext,
): SavingsOutcome {
  const { coolingUnitType } = input;

  if (coolingUnitType === undefined || allocatedKwh <= 0) return NO_SAVINGS;

  const { coolingUnits, alternator } = assumptionSet;
  const fuelPerKwh = scenarioValue(
    coolingUnits[coolingUnitType].fuelPerKwh,
    scenario,
  );

  if (coolingUnitType === "DIESEL") {
    return outcomeForFuel("diesel", allocatedKwh * fuelPerKwh, prices);
  }

  const engineFuel = fuelOfEngine(input.engineType);

  if (engineFuel === "grid") {
    return outcomeForFuel("grid", allocatedKwh, prices);
  }

  if (coolingUnitType === "ELECTRIC" && engineFuel === "petrol") {
    return outcomeForFuel(
      "petrol",
      allocatedKwh * scenarioValue(alternator.petrolFuelPerKwh, scenario),
      prices,
    );
  }

  return outcomeForFuel(engineFuel, allocatedKwh * fuelPerKwh, prices);
}
