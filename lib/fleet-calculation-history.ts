import { ScenarioKind } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export interface CalculationHistoryRow {
  id: string;
  manufacturer: string;
  model: string;
  quantity: number;
  createdAt: Date;
  assumptionSetVersion: string | null;
  paybackMonths: number | null;
  hasResult: boolean;
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
        select: { manufacturer: true, model: true, quantity: true },
      },
      scenarios: {
        where: { kind: ScenarioKind.REALISTIC },
        select: { assumptionSetVersion: true, result: true },
      },
    },
  });

  return calculations.map(({ id, createdAt, vehicle, scenarios }) => {
    const realistic = scenarios[0];
    const result = realistic?.result ?? null;

    return {
      id,
      createdAt,
      ...vehicle,
      assumptionSetVersion: realistic?.assumptionSetVersion ?? null,
      paybackMonths: result?.paybackPeriodMonths ?? null,
      hasResult: result !== null,
    };
  });
}
