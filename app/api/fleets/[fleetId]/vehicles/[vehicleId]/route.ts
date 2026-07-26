import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  requireFleetRole,
  ANY_FLEET_ROLE,
  FLEET_EDITOR_ROLES,
  FLEET_OWNER_ONLY,
} from "@/lib/fleet-auth";
import { toErrorResponse } from "@/lib/api-errors";
import { vehicleUpdateSchema } from "@/lib/vehicle-schema";
import { findActiveVehicle } from "@/lib/vehicle-repo";
import { recordAuditEvent, AuditAction, AuditEntityType } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fleetId: string; vehicleId: string }> },
) {
  try {
    const { fleetId, vehicleId } = await params;
    const session = await auth();
    await requireFleetRole(session, fleetId, ANY_FLEET_ROLE);

    const vehicle = await findActiveVehicle(fleetId, vehicleId);

    if (!vehicle) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ fleetId: string; vehicleId: string }> },
) {
  try {
    const { fleetId, vehicleId } = await params;
    const session = await auth();
    const membership = await requireFleetRole(
      session,
      fleetId,
      FLEET_EDITOR_ROLES,
    );

    const body = await request.json();
    const data = vehicleUpdateSchema.parse(body);

    const vehicle = await prisma.$transaction(async (tx) => {
      const updated = await tx.vehicle.update({
        where: { id_fleetId: { id: vehicleId, fleetId }, deletedAt: null },
        data,
      });

      await recordAuditEvent(tx, {
        fleetId,
        actorUserId: membership.userId,
        action: AuditAction.VEHICLE_UPDATED,
        entityType: AuditEntityType.VEHICLE,
        entityId: updated.id,
        metadata: { updatedFields: data },
      });

      return updated;
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fleetId: string; vehicleId: string }> },
) {
  try {
    const { fleetId, vehicleId } = await params;
    const session = await auth();
    const membership = await requireFleetRole(
      session,
      fleetId,
      FLEET_OWNER_ONLY,
    );

    await prisma.$transaction(async (tx) => {
      const deleted = await tx.vehicle.update({
        where: { id_fleetId: { id: vehicleId, fleetId }, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      await recordAuditEvent(tx, {
        fleetId,
        actorUserId: membership.userId,
        action: AuditAction.VEHICLE_DELETED,
        entityType: AuditEntityType.VEHICLE,
        entityId: deleted.id,
        metadata: {},
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
