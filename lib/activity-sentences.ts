import { Role } from "@/app/generated/prisma/enums";
import { AuditAction, AuditEntityType } from "@/lib/audit";
import {
  formatInputValue,
  type InputValueFormatContext,
} from "@/lib/input-value-format";
import { INPUT_VALUE_KINDS, type InputKey } from "@/lib/results-view-model";
import { ROLE_DISPLAY, ROLE_MESSAGE_NAMESPACE } from "@/lib/role-display";
import { userDisplayName } from "@/lib/user-display-name";
import type { VehicleChangeValue } from "@/lib/vehicle-changes";
import { vehicleInputSchema } from "@/lib/vehicle-schema";

export interface ActivityEvent {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  metadata: unknown;
  createdAt: string;
  actorUser: { id: string; email: string; name: string | null } | null;
  subjectName: string | null;
}

type VehicleField = keyof typeof vehicleInputSchema.shape;

const EVENT_MESSAGE_NAMESPACE = "audit.events";
const FIELD_LABEL_NAMESPACE = "audit.fields";
const COUNTRY_FIELD: VehicleField = "country";
const COUNTRY_INPUT_KEY: InputKey = "countryCode";

export const ACTIVITY_MESSAGE_KEYS: Record<AuditAction, string> = {
  [AuditAction.FLEET_CREATED]: `${EVENT_MESSAGE_NAMESPACE}.fleetCreated`,
  [AuditAction.VEHICLE_CREATED]: `${EVENT_MESSAGE_NAMESPACE}.vehicleCreated`,
  [AuditAction.VEHICLE_UPDATED]: `${EVENT_MESSAGE_NAMESPACE}.vehicleUpdated`,
  [AuditAction.VEHICLE_DELETED]: `${EVENT_MESSAGE_NAMESPACE}.vehicleDeleted`,
  [AuditAction.CALCULATION_CREATED]: `${EVENT_MESSAGE_NAMESPACE}.calculationCreated`,
  [AuditAction.ACCESS_DENIED]: `${EVENT_MESSAGE_NAMESPACE}.accessDenied`,
  [AuditAction.MEMBERSHIP_ADDED]: `${EVENT_MESSAGE_NAMESPACE}.membershipAdded`,
  [AuditAction.MEMBERSHIP_ROLE_UPDATED]: `${EVENT_MESSAGE_NAMESPACE}.membershipRoleUpdated`,
  [AuditAction.MEMBERSHIP_REMOVED]: `${EVENT_MESSAGE_NAMESPACE}.membershipRemoved`,
  [AuditAction.INVITATION_CREATED]: `${EVENT_MESSAGE_NAMESPACE}.invitationCreated`,
  [AuditAction.INVITATION_CLAIMED]: `${EVENT_MESSAGE_NAMESPACE}.invitationClaimed`,
  [AuditAction.INVITATION_CANCELED]: `${EVENT_MESSAGE_NAMESPACE}.invitationCanceled`,
};

const VEHICLE_FIELD_CHANGED_MESSAGE_KEY = `${EVENT_MESSAGE_NAMESPACE}.vehicleUpdatedField`;
const UNKNOWN_ACTOR_MESSAGE_KEY = "audit.unknownActor";
const UNKNOWN_ROLE_MESSAGE_KEY = "audit.unknownRole";
const VALUE_NOT_SET_MESSAGE_KEY = "audit.valueNotSet";
const UNKNOWN_SUBJECT_MESSAGE_KEYS: Record<AuditEntityType, string> = {
  [AuditEntityType.FLEET]: "audit.unknownSubject.fleet",
  [AuditEntityType.VEHICLE]: "audit.unknownSubject.vehicle",
  [AuditEntityType.CALCULATION]: "audit.unknownSubject.calculation",
  [AuditEntityType.MEMBERSHIP]: "audit.unknownSubject.person",
  [AuditEntityType.INVITATION]: "audit.unknownSubject.person",
};

interface VehicleFieldChange {
  field: VehicleField;
  from: VehicleChangeValue;
  to: VehicleChangeValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isChangeValue(value: unknown): value is VehicleChangeValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isVehicleField(field: unknown): field is VehicleField {
  return typeof field === "string" && field in vehicleInputSchema.shape;
}

function readVehicleChanges(metadata: unknown): VehicleFieldChange[] {
  if (!isRecord(metadata) || !Array.isArray(metadata.changes)) return [];

  return metadata.changes.flatMap((change: unknown) =>
    isRecord(change) &&
    isVehicleField(change.field) &&
    isChangeValue(change.from) &&
    isChangeValue(change.to)
      ? [{ field: change.field, from: change.from, to: change.to }]
      : [],
  );
}

function readRole(metadata: unknown): Role | null {
  if (!isRecord(metadata)) return null;
  const role = metadata.role;
  return (Object.values(Role) as unknown[]).includes(role)
    ? (role as Role)
    : null;
}

function formatChangeValue(
  field: VehicleField,
  value: VehicleChangeValue,
  context: InputValueFormatContext,
) {
  if (value === null) return context.translate(VALUE_NOT_SET_MESSAGE_KEY);
  if (field === COUNTRY_FIELD) return String(value);

  const key = field as InputKey;
  return formatInputValue(
    { key, kind: INPUT_VALUE_KINDS[key], value },
    context,
  );
}

function labelFor(field: VehicleField, context: InputValueFormatContext) {
  const labelKey = field === COUNTRY_FIELD ? COUNTRY_INPUT_KEY : field;
  return context.translate(`${FIELD_LABEL_NAMESPACE}.${labelKey}`);
}

export function buildActivitySentences(
  event: ActivityEvent,
  context: InputValueFormatContext,
): string[] {
  const { translate } = context;
  const role = readRole(event.metadata);
  const sharedValues = {
    actor: event.actorUser
      ? userDisplayName(event.actorUser)
      : translate(UNKNOWN_ACTOR_MESSAGE_KEY),
    subject:
      event.subjectName ??
      translate(UNKNOWN_SUBJECT_MESSAGE_KEYS[event.entityType]),
    role: role
      ? translate(`${ROLE_MESSAGE_NAMESPACE}.${ROLE_DISPLAY[role].messageKey}`)
      : translate(UNKNOWN_ROLE_MESSAGE_KEY),
  };

  if (event.action === AuditAction.VEHICLE_UPDATED) {
    const fieldSentences = readVehicleChanges(event.metadata).map(
      ({ field, from, to }) =>
        translate(VEHICLE_FIELD_CHANGED_MESSAGE_KEY, {
          ...sharedValues,
          field: labelFor(field, context),
          from: formatChangeValue(field, from, context),
          to: formatChangeValue(field, to, context),
        }),
    );
    if (fieldSentences.length > 0) return fieldSentences;
  }

  return [translate(ACTIVITY_MESSAGE_KEYS[event.action], sharedValues)];
}
