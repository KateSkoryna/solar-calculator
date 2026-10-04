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
import { inviteOrAddMember } from "@/lib/invitation-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fleetId: string }> },
) {
  try {
    const { fleetId } = await params;
    const session = await auth();
    const access = await requireFleetRole(session, fleetId, ANY_FLEET_ROLE);

    const members = await prisma.fleetMembership.findMany({
      where: { fleetId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    const invitations = FLEET_OWNER_ONLY.includes(access.role)
      ? await prisma.fleetInvitation.findMany({
          where: { fleetId },
          orderBy: { createdAt: "asc" },
        })
      : [];

    return NextResponse.json({ members, invitations });
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

    const result = await prisma.$transaction((tx) =>
      inviteOrAddMember(tx, {
        fleetId,
        email,
        role,
        actorUserId: actor.userId,
      }),
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
