import { ScenarioKind } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { NamedVehicle } from "@/lib/vehicle-display-name";

export interface CalculationHistoryRow extends NamedVehicle {
  id: string;
  quantity: number;
  createdAt: Date;
  assumptionSetVersion: string | null;
  paybackMonths: number | null;
  hasResult: boolean;
  vehicleEditedAt: Date | null;
}

export async function loadFleetCalculationHistory(
  fleetId: string,
): Promise<CalculationHistoryRow[]> {
  const calculations = await prisma.calculation.findMany({
    where: { fleetId, vehicle: { deletedAt: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      vehicle: {
        select: {
          name: true,
          manufacturer: true,
          model: true,
          vehicleType: true,
          city: true,
          quantity: true,
          editedAt: true,
        },
      },
      scenarios: {
        where: { kind: ScenarioKind.REALISTIC },
        select: { assumptionSetVersion: true, result: true },
      },
    },
  });

  return calculations.map(({ id, createdAt, vehicle, scenarios }) => {
    const { editedAt, ...vehicleFields } = vehicle;
    const realistic = scenarios[0];
    const result = realistic?.result ?? null;

    return {
      id,
      createdAt,
      ...vehicleFields,
      vehicleEditedAt: editedAt,
      assumptionSetVersion: realistic?.assumptionSetVersion ?? null,
      paybackMonths: result?.paybackPeriodMonths ?? null,
      hasResult: result !== null,
    };
  });
}
