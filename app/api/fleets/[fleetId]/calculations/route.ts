import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  requireFleetRole,
  ANY_FLEET_ROLE,
  FLEET_EDITOR_ROLES,
} from "@/lib/fleet-auth";
import { toErrorResponse } from "@/lib/api-errors";
import { calculationInputSchema } from "@/lib/calculation-schema";
import { findActiveVehicle } from "@/lib/vehicle-repo";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fleetId: string }> },
) {
  try {
    const { fleetId } = await params;
    const session = await auth();
    await requireFleetRole(session, fleetId, ANY_FLEET_ROLE);

    const calculations = await prisma.calculation.findMany({
      where: { fleetId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ calculations });
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
    const data = calculationInputSchema.parse(body);

    const vehicle = await findActiveVehicle(fleetId, data.vehicleId);

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const calculation = await prisma.calculation.create({
      data: {
        fleetId,
        vehicleId: data.vehicleId,
        notes: data.notes,
        requestedByUserId: membership.userId,
      },
    });

    return NextResponse.json({ calculation }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
