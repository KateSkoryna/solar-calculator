import type { SavingsContext } from "@/lib/calculation-engine/types";
import { scenarioValue } from "@/lib/calculation-engine/scenario-values";

export function batteryBreakdownSavingsPerYear({
  assumptionSet,
  scenario,
}: SavingsContext): number {
  const { failureRatePerYear, costPerCallOutEur } =
    assumptionSet.batteryBreakdowns;
  const failuresAvoidedPerYear =
    scenarioValue(failureRatePerYear.withoutSolar, scenario) -
    scenarioValue(failureRatePerYear.withSolar, scenario);

  return failuresAvoidedPerYear * scenarioValue(costPerCallOutEur, scenario);
}

function replacementsByEndOfYear(year: number, lifeYears: number): number {
  return Math.floor(year / lifeYears);
}

export function batteryReplacementSavingsInYear(
  year: number,
  { assumptionSet, scenario }: SavingsContext,
): number {
  const { batteryLifeYears, batteryPriceEur } = assumptionSet.batteryBreakdowns;
  const lifeWithoutSolar = scenarioValue(
    batteryLifeYears.withoutSolar,
    scenario,
  );
  const lifeWithSolar = scenarioValue(batteryLifeYears.withSolar, scenario);

  const replacementsAvoided =
    replacementsByEndOfYear(year, lifeWithoutSolar) -
    replacementsByEndOfYear(year - 1, lifeWithoutSolar) -
    (replacementsByEndOfYear(year, lifeWithSolar) -
      replacementsByEndOfYear(year - 1, lifeWithSolar));

  return replacementsAvoided * scenarioValue(batteryPriceEur, scenario);
}
