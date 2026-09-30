import type { AssumptionSet } from "@/lib/assumptions/v1";
import {
  DAYS_PER_YEAR,
  MONTHS_PER_YEAR,
} from "@/lib/calculation-engine/constants";
import { findNearestYieldLocation } from "@/lib/calculation-engine/location";
import { scenarioValue } from "@/lib/calculation-engine/scenario-values";
import type {
  EnergyAllocation,
  EnergyDemands,
  ResolvedInput,
  ScenarioKind,
} from "@/lib/calculation-engine/types";

const ENGINES_WITH_ALTERNATOR_FUEL = ["DIESEL", "PETROL"];
const ENGINES_WITH_DIRECT_CHARGING = ["ELECTRIC", "HYBRID"];

export function operatingDaysPerYear(input: ResolvedInput): number {
  return (DAYS_PER_YEAR * input.operatingMonthsPerYear) / MONTHS_PER_YEAR;
}

export function annualYieldPerKwp(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  scenario: ScenarioKind,
): number {
  const { yield: locationYield } = findNearestYieldLocation(
    assumptionSet,
    input,
  );
  const verticalShare = scenarioValue(
    assumptionSet.placement[input.solarPanelPlacement].verticalShare,
    scenario,
  );
  const flatYield = scenarioValue(locationYield.flat, scenario);
  const verticalYield = scenarioValue(locationYield.vertical, scenario);

  return (1 - verticalShare) * flatYield + verticalShare * verticalYield;
}

export function solarEnergyPerVehicleYear(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  scenario: ScenarioKind,
): number {
  const { losses, shading } = assumptionSet;
  const lossFactor =
    (1 - scenarioValue(losses.flatMounting, scenario)) *
    (1 - scenarioValue(losses.soiling, scenario)) *
    (1 - scenarioValue(losses.wiring, scenario));
  const shadingFactor = scenarioValue(shading[input.parkingType], scenario);
  const operatingShare = input.operatingMonthsPerYear / MONTHS_PER_YEAR;

  return (
    input.solarPanelCapacityKw *
    annualYieldPerKwp(assumptionSet, input, scenario) *
    lossFactor *
    shadingFactor *
    operatingShare
  );
}

function coolingDemandKwh(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  scenario: ScenarioKind,
): number {
  if (input.cargoType !== "CHILLED" || input.coolingUnitType === undefined) {
    return 0;
  }

  const { summer, winter } =
    assumptionSet.coolingUnits[input.coolingUnitType].electricalDemandPerDay;
  const summerDemand = scenarioValue(summer, scenario);
  const winterDemand = scenarioValue(winter, scenario);
  const demandPerDay = input.winterUsage
    ? (summerDemand + winterDemand) / 2
    : summerDemand;

  return demandPerDay * operatingDaysPerYear(input);
}

function idlingDemandKwh(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  scenario: ScenarioKind,
): number {
  return (
    input.idleHoursPerDay *
    scenarioValue(assumptionSet.idling.cabClimateDemandKw, scenario) *
    operatingDaysPerYear(input)
  );
}

function auxiliaryDemandKwh(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  scenario: ScenarioKind,
): number {
  return (
    scenarioValue(
      assumptionSet.vehicleTypes[input.vehicleType].auxiliaryDemandPerDay,
      scenario,
    ) * operatingDaysPerYear(input)
  );
}

function tractionDemandKwh(input: ResolvedInput): number {
  return (
    ((input.averageDailyDistanceKm * input.energyConsumptionKwhPer100km) /
      100) *
    operatingDaysPerYear(input)
  );
}

export function computeEnergyDemands(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  scenario: ScenarioKind,
): EnergyDemands {
  const auxiliaryKwh = auxiliaryDemandKwh(assumptionSet, input, scenario);
  const usesAlternator = ENGINES_WITH_ALTERNATOR_FUEL.includes(
    input.engineType,
  );
  const chargesDirectly = ENGINES_WITH_DIRECT_CHARGING.includes(
    input.engineType,
  );

  return {
    coolingKwh: coolingDemandKwh(assumptionSet, input, scenario),
    idlingKwh: idlingDemandKwh(assumptionSet, input, scenario),
    auxiliaryKwh: usesAlternator ? auxiliaryKwh : 0,
    directChargingKwh: chargesDirectly
      ? tractionDemandKwh(input) + auxiliaryKwh
      : 0,
  };
}

function takeFrom(available: number, demand: number) {
  const allocated = Math.min(available, Math.max(demand, 0));
  return { allocated, remaining: available - allocated };
}

export function allocateEnergy(
  producedKwh: number,
  demands: EnergyDemands,
): EnergyAllocation {
  const cooling = takeFrom(producedKwh, demands.coolingKwh);
  const idling = takeFrom(cooling.remaining, demands.idlingKwh);
  const auxiliary = takeFrom(idling.remaining, demands.auxiliaryKwh);
  const directCharging = takeFrom(
    auxiliary.remaining,
    demands.directChargingKwh,
  );

  return {
    producedKwh,
    coolingKwh: cooling.allocated,
    idlingKwh: idling.allocated,
    auxiliaryKwh: auxiliary.allocated,
    directChargingKwh: directCharging.allocated,
    wastedKwh: directCharging.remaining,
  };
}
