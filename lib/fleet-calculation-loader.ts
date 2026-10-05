import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { ANY_FLEET_ROLE, requireFleetRole } from "@/lib/fleet-auth";
import { findFleetBySlug } from "@/lib/fleet-repo";

export async function loadFleetCalculation(
  session: Session | null,
  fleetSlug: string,
  calculationId: string,
) {
  const fleet = await findFleetBySlug(fleetSlug);
  if (!fleet) return null;

  await requireFleetRole(session, fleet.id, ANY_FLEET_ROLE);

  return prisma.calculation.findFirst({
    where: { id: calculationId, fleetId: fleet.id },
    select: {
      requestedByUser: { select: { name: true, email: true } },
      scenarios: { include: { inputSnapshot: true, result: true } },
    },
  });
}
