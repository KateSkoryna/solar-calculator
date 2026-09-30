import type { AssumptionSet } from "@/lib/assumptions/v1";
import { scenarioValue } from "@/lib/calculation-engine/scenario-values";
import type {
  CalculationInput,
  InputSource,
  InputSources,
  ResolvedInput,
  ScenarioKind,
} from "@/lib/calculation-engine/types";

const RESOLVABLE_INPUT_KEYS = [
  "energyConsumptionKwhPer100km",
  "solarPanelCapacityKw",
  "payloadReserveKg",
  "maxRoofLoadKg",
  "idleHoursPerDay",
  "coolingUnitType",
] as const;

const NO_IDLING_HOURS = 0;

function sourceOf(value: unknown): InputSource {
  return value === undefined ? "PRESET" : "PROVIDED";
}

export function resolveInputSources(input: CalculationInput): InputSources {
  const sources: InputSources = {};

  for (const key of Object.keys(input) as (keyof CalculationInput)[]) {
    if (input[key] !== undefined) sources[key] = "PROVIDED";
  }

  if (input.cargoType !== "CHILLED") delete sources.coolingUnitType;

  for (const key of RESOLVABLE_INPUT_KEYS) {
    if (key === "coolingUnitType" && input.cargoType !== "CHILLED") continue;
    sources[key] = sourceOf(input[key]);
  }

  return sources;
}

export function resolveInput(
  input: CalculationInput,
  assumptionSet: AssumptionSet,
  scenario: ScenarioKind,
): ResolvedInput {
  const vehicleAssumptions = assumptionSet.vehicleTypes[input.vehicleType];
  const isChilled = input.cargoType === "CHILLED";

  return {
    ...input,
    energyConsumptionKwhPer100km:
      input.energyConsumptionKwhPer100km ??
      scenarioValue(vehicleAssumptions.energyUsePer100km, scenario),
    solarPanelCapacityKw:
      input.solarPanelCapacityKw ??
      scenarioValue(
        vehicleAssumptions.usablePanelCapacityKw[input.solarPanelPlacement],
        scenario,
      ),
    payloadReserveKg:
      input.payloadReserveKg ??
      scenarioValue(vehicleAssumptions.payloadReserveKg, scenario),
    maxRoofLoadKg:
      input.maxRoofLoadKg ??
      scenarioValue(vehicleAssumptions.maxRoofLoadKg, scenario),
    idleHoursPerDay: input.idleHoursPerDay ?? NO_IDLING_HOURS,
    coolingUnitType: isChilled
      ? (input.coolingUnitType ??
        assumptionSet.typicalCoolingUnit[input.vehicleType])
      : undefined,
  };
}
