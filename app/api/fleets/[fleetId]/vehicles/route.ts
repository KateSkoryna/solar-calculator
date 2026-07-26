import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  requireFleetRole,
  ANY_FLEET_ROLE,
  FLEET_EDITOR_ROLES,
} from "@/lib/fleet-auth";
import { toErrorResponse } from "@/lib/api-errors";
import { vehicleInputSchema } from "@/lib/vehicle-schema";
import { recordAuditEvent, AuditAction, AuditEntityType } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fleetId: string }> },
) {
  try {
    const { fleetId } = await params;
    const session = await auth();
    await requireFleetRole(session, fleetId, ANY_FLEET_ROLE);

    const vehicles = await prisma.vehicle.findMany({
      where: { fleetId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ vehicles });
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
    const membership = await requireFleetRole(
      session,
      fleetId,
      FLEET_EDITOR_ROLES,
    );

    const body = await request.json();
    const data = vehicleInputSchema.parse(body);

    const vehicle = await prisma.$transaction(async (tx) => {
      const created = await tx.vehicle.create({
        data: { ...data, fleetId },
      });

      await recordAuditEvent(tx, {
        fleetId,
        actorUserId: membership.userId,
        action: AuditAction.VEHICLE_CREATED,
        entityType: AuditEntityType.VEHICLE,
        entityId: created.id,
        metadata: { manufacturer: created.manufacturer, model: created.model },
      });

      return created;
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
