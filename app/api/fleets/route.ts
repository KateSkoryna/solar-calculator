import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/api-errors";
import { fleetCreateSchema } from "@/lib/fleet-create-schema";
import { createFleetWithOwner } from "@/lib/fleet-service";

const SIGN_IN_REQUIRED_RESPONSE = {
  error: "You must be signed in to perform this action",
};

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(SIGN_IN_REQUIRED_RESPONSE, { status: 401 });
    }

    const memberships = await prisma.fleetMembership.findMany({
      where: { userId },
      select: {
        role: true,
        fleet: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const fleets = memberships.map(({ fleet, role }) => ({ ...fleet, role }));

    return NextResponse.json({ fleets });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(SIGN_IN_REQUIRED_RESPONSE, { status: 401 });
    }

    const { companyName, userName } = fleetCreateSchema.parse(
      await request.json(),
    );

    const fleet = await prisma.$transaction(async (tx) => {
      if (userName) {
        await tx.user.updateMany({
          where: { id: userId, name: null },
          data: { name: userName },
        });
      }

      return createFleetWithOwner(tx, { name: companyName, userId });
    });

    return NextResponse.json({ fleet }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
