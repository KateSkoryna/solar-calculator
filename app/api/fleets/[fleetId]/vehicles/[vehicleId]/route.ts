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
    await requireFleetRole(session, fleetId, FLEET_EDITOR_ROLES);

    const body = await request.json();
    const data = vehicleUpdateSchema.parse(body);

    const vehicle = await prisma.vehicle.update({
      where: { id_fleetId: { id: vehicleId, fleetId }, deletedAt: null },
      data,
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
    await requireFleetRole(session, fleetId, FLEET_OWNER_ONLY);

    await prisma.vehicle.update({
      where: { id_fleetId: { id: vehicleId, fleetId }, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
