import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireFleetRole, ANY_FLEET_ROLE } from "@/lib/fleet-auth";
import { CALCULATION_WITH_RESULTS_INCLUDE } from "@/lib/calculation-service";
import { toErrorResponse } from "@/lib/api-errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fleetId: string; calculationId: string }> },
) {
  try {
    const { fleetId, calculationId } = await params;
    const session = await auth();
    await requireFleetRole(session, fleetId, ANY_FLEET_ROLE);

    const calculation = await prisma.calculation.findUnique({
      where: { id: calculationId, fleetId },
      include: CALCULATION_WITH_RESULTS_INCLUDE,
    });

    if (!calculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ calculation });
  } catch (error) {
    return toErrorResponse(error);
  }
}
