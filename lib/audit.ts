import { Prisma } from "@/app/generated/prisma/client";

export const AuditEntityType = {
  FLEET: "FLEET",
  VEHICLE: "VEHICLE",
  CALCULATION: "CALCULATION",
  MEMBERSHIP: "MEMBERSHIP",
} as const;

export type AuditEntityType =
  (typeof AuditEntityType)[keyof typeof AuditEntityType];

export const AuditAction = {
  VEHICLE_CREATED: "VEHICLE_CREATED",
  VEHICLE_UPDATED: "VEHICLE_UPDATED",
  VEHICLE_DELETED: "VEHICLE_DELETED",
  CALCULATION_CREATED: "CALCULATION_CREATED",
  ACCESS_DENIED: "ACCESS_DENIED",
  MEMBERSHIP_ADDED: "MEMBERSHIP_ADDED",
  MEMBERSHIP_ROLE_UPDATED: "MEMBERSHIP_ROLE_UPDATED",
  MEMBERSHIP_REMOVED: "MEMBERSHIP_REMOVED",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

interface RecordAuditEventInput {
  fleetId: string | null;
  actorUserId: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export function recordAuditEvent(
  client: Prisma.TransactionClient,
  {
    fleetId,
    actorUserId,
    action,
    entityType,
    entityId,
    metadata = {},
  }: RecordAuditEventInput,
) {
  return client.auditEvent.create({
    data: { fleetId, actorUserId, action, entityType, entityId, metadata },
  });
}
