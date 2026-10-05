import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireFleetRole, FLEET_EDITOR_ROLES } from "@/lib/fleet-auth";
import { toErrorResponse } from "@/lib/api-errors";
import { auditEventQuerySchema } from "@/lib/audit-event-query-schema";
import { Prisma } from "@/app/generated/prisma/client";
import { AuditAction } from "@/lib/audit";
import { loadAuditEventSubjectNames } from "@/lib/audit-event-labels";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fleetId: string }> },
) {
  try {
    const { fleetId } = await params;
    const session = await auth();
    await requireFleetRole(session, fleetId, FLEET_EDITOR_ROLES);

    const { searchParams } = new URL(request.url);
    const query = auditEventQuerySchema.parse({
      ...Object.fromEntries(searchParams),
      entityType: searchParams.getAll("entityType"),
    });

    const where: Prisma.AuditEventWhereInput = {
      fleetId,
      ...(query.actorUserId && { actorUserId: query.actorUserId }),
      ...(query.entityType?.length && {
        entityType: { in: query.entityType },
      }),
      ...(!query.includeAccessDenied && {
        action: { not: AuditAction.ACCESS_DENIED },
      }),
      ...((query.from || query.to) && {
        createdAt: {
          ...(query.from && { gte: query.from }),
          ...(query.to && { lte: query.to }),
        },
      }),
    };

    const [events, totalCount] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          actorUser: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.auditEvent.count({ where }),
    ]);

    const subjectNames = await loadAuditEventSubjectNames(
      prisma,
      fleetId,
      events,
    );

    return NextResponse.json({
      events: events.map((event, index) => ({
        ...event,
        subjectName: subjectNames[index],
      })),
      totalCount,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
