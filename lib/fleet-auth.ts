import { Session } from "next-auth";
import { Role } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class ForbiddenError extends Error {
  readonly statusCode = 403;

  constructor(message = "You do not have access to this fleet") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireFleetRole(
  session: Session | null,
  fleetId: string,
  allowedRoles: Role[],
) {
  const userId = session?.user?.id;

  if (!userId) {
    throw new ForbiddenError("You must be signed in to perform this action");
  }

  const membership = await prisma.fleetMembership.findUnique({
    where: {
      fleetId_userId: {
        fleetId,
        userId,
      },
    },
  });

  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new ForbiddenError("You do not have access to this fleet");
  }

  return membership;
}
