import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  ANY_FLEET_ROLE,
  ForbiddenError,
  requireFleetRole,
} from "@/lib/fleet-auth";
import { findFleetBySlug } from "@/lib/fleet-repo";

export interface WorkspaceFleet {
  id: string;
  name: string;
  slug: string;
}

export interface WorkspaceLayoutData {
  currentFleet: WorkspaceFleet;
  fleets: WorkspaceFleet[];
}

const WORKSPACE_FLEET_SELECT = { id: true, name: true, slug: true } as const;

async function requireMembership(session: Session | null, fleetId: string) {
  try {
    await requireFleetRole(session, fleetId, ANY_FLEET_ROLE);
    return true;
  } catch (error) {
    if (error instanceof ForbiddenError) return false;
    throw error;
  }
}

export async function loadWorkspaceLayout(
  session: Session | null,
  fleetSlug: string,
): Promise<WorkspaceLayoutData | null> {
  const currentFleet = await findFleetBySlug(fleetSlug);
  if (!currentFleet) return null;

  if (!(await requireMembership(session, currentFleet.id))) return null;

  const memberships = await prisma.fleetMembership.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "asc" },
    select: { fleet: { select: WORKSPACE_FLEET_SELECT } },
  });
  const memberFleets = memberships.map(({ fleet }) => fleet);
  const currentWorkspaceFleet = {
    id: currentFleet.id,
    name: currentFleet.name,
    slug: currentFleet.slug,
  };
  const isCurrentFleetListed = memberFleets.some(
    ({ id }) => id === currentFleet.id,
  );

  return {
    currentFleet: currentWorkspaceFleet,
    fleets: isCurrentFleetListed
      ? memberFleets
      : [currentWorkspaceFleet, ...memberFleets],
  };
}
