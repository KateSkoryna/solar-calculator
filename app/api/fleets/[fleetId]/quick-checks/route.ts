import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireFleetRole, FLEET_EDITOR_ROLES } from "@/lib/fleet-auth";
import { toErrorResponse } from "@/lib/api-errors";
import { recordAuditEvent, AuditAction, AuditEntityType } from "@/lib/audit";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import {
  CALCULATION_WITH_RESULTS_INCLUDE,
  createCalculationForVehicle,
} from "@/lib/calculation-service";
import { hashQuickCheck } from "@/lib/quick-check-hash";
import {
  quickCheckToCalculationInput,
  quickCheckToVehicleData,
} from "@/lib/quick-check-mapping";
import { quickCheckSchema } from "@/lib/quick-check-schema";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === UNIQUE_CONSTRAINT_ERROR_CODE
  );
}

async function findExistingQuickCheckCalculation(
  fleetId: string,
  sourceQuickCheckHash: string,
) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { fleetId, sourceQuickCheckHash, deletedAt: null },
    include: {
      calculations: {
        orderBy: { createdAt: "asc" },
        take: 1,
        include: CALCULATION_WITH_RESULTS_INCLUDE,
      },
    },
  });

  return vehicle?.calculations[0] ?? null;
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

    const answers = quickCheckSchema.parse(await request.json());
    const sourceQuickCheckHash = hashQuickCheck(answers);

    const existingCalculation = await findExistingQuickCheckCalculation(
      fleetId,
      sourceQuickCheckHash,
    );

    if (existingCalculation) {
      return NextResponse.json(
        { calculation: existingCalculation },
        { status: 200 },
      );
    }

    let calculation;
    try {
      calculation = await prisma.$transaction(async (tx) => {
        await tx.vehicle.updateMany({
          where: { fleetId, sourceQuickCheckHash, deletedAt: { not: null } },
          data: { sourceQuickCheckHash: null },
        });

        const vehicle = await tx.vehicle.create({
          data: {
            ...quickCheckToVehicleData(answers, ASSUMPTION_SET_V1),
            fleetId,
            sourceQuickCheckHash,
          },
        });

        await recordAuditEvent(tx, {
          fleetId,
          actorUserId: membership.userId,
          action: AuditAction.VEHICLE_CREATED,
          entityType: AuditEntityType.VEHICLE,
          entityId: vehicle.id,
          metadata: {
            manufacturer: vehicle.manufacturer,
            model: vehicle.model,
          },
        });

        return createCalculationForVehicle(tx, {
          fleetId,
          vehicle,
          requestedByUserId: membership.userId,
          input: quickCheckToCalculationInput(answers, ASSUMPTION_SET_V1),
        });
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;

      const concurrentCalculation = await findExistingQuickCheckCalculation(
        fleetId,
        sourceQuickCheckHash,
      );
      if (!concurrentCalculation) throw error;

      return NextResponse.json(
        { calculation: concurrentCalculation },
        { status: 200 },
      );
    }

    return NextResponse.json({ calculation }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
