import type { Prisma } from "@/app/generated/prisma/client";
import { Role } from "@/app/generated/prisma/enums";
import { AuditAction, AuditEntityType, recordAuditEvent } from "@/lib/audit";
import { createUniqueFleetSlug } from "@/lib/fleet-slug";

interface CreateFleetWithOwnerParams {
  name: string;
  userId: string;
}

export async function createFleetWithOwner(
  transaction: Prisma.TransactionClient,
  { name, userId }: CreateFleetWithOwnerParams,
) {
  const slug = await createUniqueFleetSlug(transaction, name);

  const fleet = await transaction.fleet.create({ data: { name, slug } });

  await transaction.fleetMembership.create({
    data: { fleetId: fleet.id, userId, role: Role.OWNER },
  });

  await recordAuditEvent(transaction, {
    fleetId: fleet.id,
    actorUserId: userId,
    action: AuditAction.FLEET_CREATED,
    entityType: AuditEntityType.FLEET,
    entityId: fleet.id,
    metadata: { slug },
  });

  return fleet;
}
