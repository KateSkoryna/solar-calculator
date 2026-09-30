import type {
  Prices,
  SavingsContext,
  SavingsOutcome,
} from "@/lib/calculation-engine/types";
import type { AssumptionSet } from "@/lib/assumptions/v1";
import {
  allocateEnergy,
  computeEnergyDemands,
  solarEnergyPerVehicleYear,
} from "@/lib/calculation-engine/energy";
import {
  annualMaintenanceCents,
  cumulativeSeries,
  oneTimeCostBeforeSubsidyCents,
  paybackMonths,
  subsidyCents,
  toCents,
} from "@/lib/calculation-engine/finance";
import { resolveInput } from "@/lib/calculation-engine/resolve-inputs";
import { alternatorFuelSavings } from "@/lib/calculation-engine/savings/alternator-fuel";
import {
  batteryBreakdownSavingsPerYear,
  batteryReplacementSavingsInYear,
} from "@/lib/calculation-engine/savings/battery-breakdowns";
import { coolingUnitFuelSavings } from "@/lib/calculation-engine/savings/cooling-unit-fuel";
import { directChargingSavings } from "@/lib/calculation-engine/savings/direct-charging";
import { lessIdlingSavings } from "@/lib/calculation-engine/savings/less-idling";
import {
  PAYBACK_HORIZON_YEARS,
  SERIES_YEARS,
} from "@/lib/calculation-engine/constants";
import { scenarioValue } from "@/lib/calculation-engine/scenario-values";
import {
  SAVINGS_TYPES,
  type CalculationInput,
  type EnergyAllocation,
  type SavingsByType,
  type ScenarioKind,
  type ScenarioResult,
} from "@/lib/calculation-engine/types";

interface YearOutcome {
  savingsByTypeCents: SavingsByType;
  allocation: EnergyAllocation;
  co2AvoidedKg: number;
}

function pricesFor(
  assumptionSet: AssumptionSet,
  input: SavingsContext["input"],
  scenario: ScenarioKind,
): Prices {
  const country = assumptionSet.countries[input.countryCode];

  return {
    dieselPerLitre: scenarioValue(country.dieselPricePerLitre, scenario),
    petrolPerLitre: scenarioValue(country.petrolPricePerLitre, scenario),
    electricityPerKwh: scenarioValue(country.electricityPricePerKwh, scenario),
  };
}

function co2AvoidedKgPerVehicle(
  outcomes: SavingsOutcome[],
  context: SavingsContext,
): number {
  const { assumptionSet, input, scenario } = context;
  const { fuelCo2 } = assumptionSet;
  const gridFactor = scenarioValue(
    assumptionSet.countries[input.countryCode].gridCo2FactorKgPerKwh,
    scenario,
  );

  return outcomes.reduce(
    (sum, outcome) =>
      sum +
      outcome.dieselLitres * scenarioValue(fuelCo2.dieselKgPerLitre, scenario) +
      outcome.petrolLitres * scenarioValue(fuelCo2.petrolKgPerLitre, scenario) +
      outcome.gridKwh * gridFactor,
    0,
  );
}

function computeYear(context: SavingsContext, year: number): YearOutcome {
  const { assumptionSet, input, scenario } = context;
  const { degradation } = assumptionSet;
  const yearsInService = year - 1;
  const panelFactor =
    (1 - scenarioValue(degradation.panelPerYear, scenario)) ** yearsInService;
  const batteryFactor =
    (1 - scenarioValue(degradation.batteryCapacityLossPerYear, scenario)) **
    yearsInService;

  const demands = computeEnergyDemands(assumptionSet, input, scenario);
  const allocation = allocateEnergy(
    solarEnergyPerVehicleYear(assumptionSet, input, scenario) * panelFactor,
    {
      ...demands,
      directChargingKwh: demands.directChargingKwh * batteryFactor,
    },
  );

  const outcomes: Record<
    Exclude<(typeof SAVINGS_TYPES)[number], "FEWER_BATTERY_BREAKDOWNS">,
    SavingsOutcome
  > = {
    COOLING_UNIT_FUEL: coolingUnitFuelSavings(allocation.coolingKwh, context),
    LESS_IDLING: lessIdlingSavings(
      allocation.idlingKwh,
      demands.idlingKwh,
      context,
    ),
    ALTERNATOR_FUEL: alternatorFuelSavings(allocation.auxiliaryKwh, context),
    DIRECT_CHARGING: directChargingSavings(
      allocation.directChargingKwh,
      context,
    ),
  };

  const batteryEuros =
    batteryBreakdownSavingsPerYear(context) +
    batteryReplacementSavingsInYear(year, context);

  const toGroupCents = (euros: number) => toCents(euros * input.quantity);
  const savingsByTypeCents: SavingsByType = {
    COOLING_UNIT_FUEL: toGroupCents(outcomes.COOLING_UNIT_FUEL.euros),
    LESS_IDLING: toGroupCents(outcomes.LESS_IDLING.euros),
    FEWER_BATTERY_BREAKDOWNS: toGroupCents(batteryEuros),
    ALTERNATOR_FUEL: toGroupCents(outcomes.ALTERNATOR_FUEL.euros),
    DIRECT_CHARGING: toGroupCents(outcomes.DIRECT_CHARGING.euros),
  };

  return {
    savingsByTypeCents,
    allocation: scaleAllocation(allocation, input.quantity),
    co2AvoidedKg:
      co2AvoidedKgPerVehicle(Object.values(outcomes), context) * input.quantity,
  };
}

function scaleAllocation(
  allocation: EnergyAllocation,
  quantity: number,
): EnergyAllocation {
  return {
    producedKwh: allocation.producedKwh * quantity,
    coolingKwh: allocation.coolingKwh * quantity,
    idlingKwh: allocation.idlingKwh * quantity,
    auxiliaryKwh: allocation.auxiliaryKwh * quantity,
    directChargingKwh: allocation.directChargingKwh * quantity,
    wastedKwh: allocation.wastedKwh * quantity,
  };
}

function sumCents(savingsByTypeCents: SavingsByType): number {
  return SAVINGS_TYPES.reduce((sum, type) => sum + savingsByTypeCents[type], 0);
}

export function calculateScenario(
  input: CalculationInput,
  assumptionSet: AssumptionSet,
  scenario: ScenarioKind,
): ScenarioResult {
  const resolvedInput = resolveInput(input, assumptionSet, scenario);
  const context: SavingsContext = {
    assumptionSet,
    input: resolvedInput,
    scenario,
    prices: pricesFor(assumptionSet, resolvedInput, scenario),
  };

  const costBefore = oneTimeCostBeforeSubsidyCents(
    assumptionSet,
    resolvedInput,
    scenario,
  );
  const subsidy = subsidyCents(assumptionSet, resolvedInput, costBefore);
  const costAfter = costBefore - subsidy;
  const maintenance = annualMaintenanceCents(
    assumptionSet,
    resolvedInput,
    scenario,
  );

  const years = Array.from({ length: PAYBACK_HORIZON_YEARS }, (_, index) =>
    computeYear(context, index + 1),
  );
  const yearlyNetCents = years.map(
    (year) => sumCents(year.savingsByTypeCents) - maintenance,
  );
  const series = cumulativeSeries(costAfter, yearlyNetCents);
  const [firstYear] = years;

  return {
    kind: scenario,
    resolvedInput,
    annualSavingsCents: sumCents(firstYear.savingsByTypeCents),
    savingsByTypeCents: firstYear.savingsByTypeCents,
    annualMaintenanceCents: maintenance,
    oneTimeCostBeforeSubsidyCents: costBefore,
    subsidyCents: subsidy,
    oneTimeCostAfterSubsidyCents: costAfter,
    paybackMonths: paybackMonths(costAfter, yearlyNetCents),
    cumulativeSavingsSeriesCents: series,
    yearlySolarEnergyKwh: firstYear.allocation.producedKwh,
    co2AvoidedKgPerYear: firstYear.co2AvoidedKg,
    tenYearNetGainCents: series[SERIES_YEARS],
    energy: firstYear.allocation,
  };
}
