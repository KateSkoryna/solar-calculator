import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  requireFleetRole,
  ANY_FLEET_ROLE,
  FLEET_OWNER_ONLY,
} from "@/lib/fleet-auth";
import { toErrorResponse } from "@/lib/api-errors";
import { membershipInputSchema } from "@/lib/membership-schema";
import { recordAuditEvent, AuditAction, AuditEntityType } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fleetId: string }> },
) {
  try {
    const { fleetId } = await params;
    const session = await auth();
    await requireFleetRole(session, fleetId, ANY_FLEET_ROLE);

    const members = await prisma.fleetMembership.findMany({
      where: { fleetId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fleetId: string }> },
) {
  try {
    const { fleetId } = await params;
    const session = await auth();
    const actor = await requireFleetRole(session, fleetId, FLEET_OWNER_ONLY);

    const body = await request.json();
    const { email, role } = membershipInputSchema.parse(body);

    const targetUser = await prisma.user.findUnique({ where: { email } });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const member = await prisma.$transaction(async (tx) => {
      const created = await tx.fleetMembership.create({
        data: { fleetId, userId: targetUser.id, role },
      });

      await recordAuditEvent(tx, {
        fleetId,
        actorUserId: actor.userId,
        action: AuditAction.MEMBERSHIP_ADDED,
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: created.id,
        metadata: { userId: targetUser.id, role },
      });

      return created;
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
