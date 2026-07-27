import { Session } from "next-auth";
import { Role } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent, AuditAction, AuditEntityType } from "@/lib/audit";

export class ForbiddenError extends Error {
  readonly statusCode = 403;

  constructor(message = "You do not have access to this fleet") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export const ANY_FLEET_ROLE: Role[] = Object.values(Role);
export const FLEET_EDITOR_ROLES: Role[] = [Role.OWNER, Role.MANAGER];
export const FLEET_OWNER_ONLY: Role[] = [Role.OWNER];

export const ADMIN_FLEET_ID = process.env.ADMIN_FLEET_ID ?? "fleet_admin";

interface FleetAccess {
  id: string;
  fleetId: string;
  userId: string;
  role: Role;
  createdAt: Date;
}

function superAdminAccess(fleetId: string, userId: string): FleetAccess {
  return {
    id: `superadmin:${userId}`,
    fleetId,
    userId,
    role: Role.OWNER,
    createdAt: new Date(),
  };
}

type AccessDeniedReason = "NO_SESSION" | "NO_MEMBERSHIP" | "ROLE_NOT_ALLOWED";

async function recordAccessDenied(
  fleetId: string,
  actorUserId: string | null,
  reason: AccessDeniedReason,
  allowedRoles: Role[],
  actualRole: Role | null,
) {
  try {
    await recordAuditEvent(prisma, {
      fleetId,
      actorUserId,
      action: AuditAction.ACCESS_DENIED,
      entityType: AuditEntityType.FLEET,
      entityId: fleetId,
      metadata: { reason, allowedRoles, actualRole },
    });
  } catch (error) {
    console.error("Failed to record ACCESS_DENIED audit event", error);
  }
}

export async function requireFleetRole(
  session: Session | null,
  fleetId: string,
  allowedRoles: Role[],
): Promise<FleetAccess> {
  const userId = session?.user?.id ?? null;

  if (!userId) {
    await recordAccessDenied(fleetId, null, "NO_SESSION", allowedRoles, null);
    throw new ForbiddenError("You must be signed in to perform this action");
  }

  if (session?.user?.isSuperAdmin && fleetId !== ADMIN_FLEET_ID) {
    return superAdminAccess(fleetId, userId);
  }

  const membership = await prisma.fleetMembership.findUnique({
    where: {
      fleetId_userId: {
        fleetId,
        userId,
      },
    },
  });

  if (!membership || !allowedRoles.includes(membership.role)) {
    await recordAccessDenied(
      fleetId,
      userId,
      membership ? "ROLE_NOT_ALLOWED" : "NO_MEMBERSHIP",
      allowedRoles,
      membership?.role ?? null,
    );
    throw new ForbiddenError("You do not have access to this fleet");
  }

  return membership;
}
