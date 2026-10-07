import {
  isResultUpToDate,
  type FleetVehicleGroup,
  type GroupCalculation,
} from "@/lib/fleet-group-status";

export interface FleetKpis {
  couldSaveEurosPerYear: number;
  averagePaybackMonths: number | null;
  co2AvoidedKgPerYear: number;
  calculatedGroupCount: number;
  groupsWithoutPaybackCount: number;
  notCalculatedYetCount: number;
}

export function aggregateFleetKpis(
  groups: FleetVehicleGroup[],
  currentAssumptionSetVersion: string,
): FleetKpis {
  const currentGroups = groups.filter((group) =>
    isResultUpToDate(group, currentAssumptionSetVersion),
  ) as (FleetVehicleGroup & { latestCalculation: GroupCalculation })[];
  const groupsWithPayback = currentGroups.filter(
    ({ latestCalculation }) => latestCalculation.paybackMonths !== null,
  );
  const vehiclesWithPayback = groupsWithPayback.reduce(
    (total, { quantity }) => total + quantity,
    0,
  );
  const weightedPaybackMonths = groupsWithPayback.reduce(
    (total, { quantity, latestCalculation }) =>
      total + (latestCalculation.paybackMonths ?? 0) * quantity,
    0,
  );

  return {
    couldSaveEurosPerYear: currentGroups.reduce(
      (total, { latestCalculation }) =>
        total + latestCalculation.annualSavingsEuros,
      0,
    ),
    averagePaybackMonths:
      vehiclesWithPayback === 0
        ? null
        : weightedPaybackMonths / vehiclesWithPayback,
    co2AvoidedKgPerYear: currentGroups.reduce(
      (total, { latestCalculation }) =>
        total + latestCalculation.co2AvoidedKgPerYear,
      0,
    ),
    calculatedGroupCount: currentGroups.length,
    groupsWithoutPaybackCount: currentGroups.length - groupsWithPayback.length,
    notCalculatedYetCount: groups.length - currentGroups.length,
  };
}
