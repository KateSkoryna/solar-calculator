import type { Session } from "next-auth";
import {
  ANY_FLEET_ROLE,
  ForbiddenError,
  requireFleetRole,
} from "@/lib/fleet-auth";
import { findFleetBySlug } from "@/lib/fleet-repo";

export async function loadFleetPageAccess(session: Session, fleetSlug: string) {
  const fleet = await findFleetBySlug(fleetSlug);
  if (!fleet) return null;

  try {
    const access = await requireFleetRole(session, fleet.id, ANY_FLEET_ROLE);
    return { fleet, access };
  } catch (error) {
    if (error instanceof ForbiddenError) return null;
    throw error;
  }
}
