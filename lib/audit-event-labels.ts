import type { Prisma } from "@/app/generated/prisma/client";
import { AuditEntityType } from "@/lib/audit";
import { userDisplayName } from "@/lib/user-display-name";

interface AuditEventSubjectSource {
  entityType: string;
  entityId: string;
  metadata: Prisma.JsonValue;
}

function readMetadataString(metadata: Prisma.JsonValue, key: string) {
  if (typeof metadata !== "object" || metadata === null) return null;
  const value = (metadata as Record<string, Prisma.JsonValue>)[key];
  return typeof value === "string" ? value : null;
}

function collectIds(
  events: AuditEventSubjectSource[],
  entityType: AuditEntityType,
  readId: (event: AuditEventSubjectSource) => string | null,
) {
  const ids = events
    .filter((event) => event.entityType === entityType)
    .map(readId)
    .filter((id): id is string => id !== null);
  return [...new Set(ids)];
}

export async function loadAuditEventSubjectNames(
  client: Prisma.TransactionClient,
  fleetId: string,
  events: AuditEventSubjectSource[],
) {
  const vehicleIds = collectIds(
    events,
    AuditEntityType.VEHICLE,
    ({ entityId }) => entityId,
  );
  const memberUserIds = collectIds(
    events,
    AuditEntityType.MEMBERSHIP,
    ({ metadata }) => readMetadataString(metadata, "userId"),
  );

  const [vehicles, members] = await Promise.all([
    client.vehicle.findMany({
      where: { fleetId, id: { in: vehicleIds } },
      select: { id: true, manufacturer: true, model: true },
    }),
    client.user.findMany({
      where: { id: { in: memberUserIds } },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const vehicleNames = new Map(
    vehicles.map(({ id, manufacturer, model }) => [
      id,
      `${manufacturer} ${model}`,
    ]),
  );
  const memberNames = new Map(
    members.map((member) => [member.id, userDisplayName(member)]),
  );

  return events.map((event) => {
    if (event.entityType === AuditEntityType.VEHICLE) {
      return vehicleNames.get(event.entityId) ?? null;
    }
    if (event.entityType === AuditEntityType.MEMBERSHIP) {
      const userId = readMetadataString(event.metadata, "userId");
      return userId ? (memberNames.get(userId) ?? null) : null;
    }
    if (event.entityType === AuditEntityType.INVITATION) {
      return readMetadataString(event.metadata, "email");
    }
    return null;
  });
}
