import { AuditEntityType } from "@/lib/audit";

export const ACTIVITY_FILTERS = {
  all: [],
  vehicles: [AuditEntityType.VEHICLE],
  calculations: [AuditEntityType.CALCULATION],
  team: [AuditEntityType.MEMBERSHIP, AuditEntityType.INVITATION],
} as const satisfies Record<string, readonly AuditEntityType[]>;

export type ActivityFilterKey = keyof typeof ACTIVITY_FILTERS;

export const ACTIVITY_FILTER_KEYS = Object.keys(
  ACTIVITY_FILTERS,
) as ActivityFilterKey[];

export const DEFAULT_ACTIVITY_FILTER: ActivityFilterKey = "all";
