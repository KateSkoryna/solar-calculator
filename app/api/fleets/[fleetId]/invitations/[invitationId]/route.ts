import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireFleetRole, FLEET_OWNER_ONLY } from "@/lib/fleet-auth";
import { toErrorResponse } from "@/lib/api-errors";
import { recordAuditEvent, AuditAction, AuditEntityType } from "@/lib/audit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fleetId: string; invitationId: string }> },
) {
  try {
    const { fleetId, invitationId } = await params;
    const session = await auth();
    const actor = await requireFleetRole(session, fleetId, FLEET_OWNER_ONLY);

    await prisma.$transaction(async (tx) => {
      const deleted = await tx.fleetInvitation.delete({
        where: { id: invitationId, fleetId },
      });

      await recordAuditEvent(tx, {
        fleetId,
        actorUserId: actor.userId,
        action: AuditAction.INVITATION_CANCELED,
        entityType: AuditEntityType.INVITATION,
        entityId: deleted.id,
        metadata: { email: deleted.email, role: deleted.role },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
