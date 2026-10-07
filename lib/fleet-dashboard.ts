import { ScenarioKind } from "@/app/generated/prisma/enums";
import type {
  FleetVehicleGroup,
  GroupCalculation,
} from "@/lib/fleet-group-status";
import { prisma } from "@/lib/prisma";

export type { FleetVehicleGroup, GroupCalculation };
export { aggregateFleetKpis, type FleetKpis } from "@/lib/fleet-kpis";

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
      editedAt: true,
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
