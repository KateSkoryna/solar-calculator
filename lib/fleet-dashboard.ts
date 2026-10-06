import { ScenarioKind } from "@/app/generated/prisma/enums";
import {
  isCalculatedWithCurrentAssumptions,
  type FleetVehicleGroup,
  type GroupCalculation,
} from "@/lib/fleet-group-status";
import { prisma } from "@/lib/prisma";

export type { FleetVehicleGroup, GroupCalculation };

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
    isCalculatedWithCurrentAssumptions(group, currentAssumptionSetVersion),
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

export async function loadFleetDashboardData(
  fleetId: string,
): Promise<FleetVehicleGroup[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: { fleetId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      manufacturer: true,
      model: true,
      vehicleType: true,
      city: true,
      quantity: true,
      calculations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          createdAt: true,
          scenarios: {
            where: { kind: ScenarioKind.REALISTIC },
            select: { assumptionSetVersion: true, result: true },
          },
        },
      },
    },
  });

  return vehicles.map(({ id, calculations, ...vehicle }) => {
    const latest = calculations[0];
    const realistic = latest?.scenarios[0];
    const result = realistic?.result;

    return {
      vehicleId: id,
      ...vehicle,
      latestCalculation:
        latest && realistic && result
          ? {
              id: latest.id,
              calculatedAt: latest.createdAt,
              assumptionSetVersion: realistic.assumptionSetVersion,
              paybackMonths: result.paybackPeriodMonths,
              annualSavingsEuros: Number(result.annualSavingsAmount),
              co2AvoidedKgPerYear: result.co2SavedKg,
            }
          : null,
    };
  });
}
