import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireFleetRole, FLEET_OWNER_ONLY } from "@/lib/fleet-auth";
import { toErrorResponse } from "@/lib/api-errors";
import { membershipUpdateSchema } from "@/lib/membership-schema";
import { recordAuditEvent, AuditAction, AuditEntityType } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ fleetId: string; userId: string }> },
) {
  try {
    const { fleetId, userId } = await params;
    const session = await auth();
    const actor = await requireFleetRole(session, fleetId, FLEET_OWNER_ONLY);

    const body = await request.json();
    const { role } = membershipUpdateSchema.parse(body);

    const member = await prisma.$transaction(async (tx) => {
      const updated = await tx.fleetMembership.update({
        where: { fleetId_userId: { fleetId, userId } },
        data: { role },
      });

      await recordAuditEvent(tx, {
        fleetId,
        actorUserId: actor.userId,
        action: AuditAction.MEMBERSHIP_ROLE_UPDATED,
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: updated.id,
        metadata: { userId, role },
      });

      return updated;
    });

    return NextResponse.json({ member });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fleetId: string; userId: string }> },
) {
  try {
    const { fleetId, userId } = await params;
    const session = await auth();
    const actor = await requireFleetRole(session, fleetId, FLEET_OWNER_ONLY);

    await prisma.$transaction(async (tx) => {
      const deleted = await tx.fleetMembership.delete({
        where: { fleetId_userId: { fleetId, userId } },
      });

      await recordAuditEvent(tx, {
        fleetId,
        actorUserId: actor.userId,
        action: AuditAction.MEMBERSHIP_REMOVED,
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: deleted.id,
        metadata: { userId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
