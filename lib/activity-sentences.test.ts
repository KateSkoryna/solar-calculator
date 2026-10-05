import { createFormatter, createTranslator } from "next-intl";
import { AuditAction, AuditEntityType } from "@/lib/audit";
import {
  ACTIVITY_MESSAGE_KEYS,
  buildActivitySentences,
  type ActivityEvent,
} from "@/lib/activity-sentences";
import englishMessages from "@/messages/en.json";

const LOCALE = "en";
const RAW_ENUM_NAME_PATTERN = /[A-Z]+_[A-Z]+/;

const translator = createTranslator({
  locale: LOCALE,
  messages: englishMessages,
});
const formatter = createFormatter({ locale: LOCALE });
const formatContext = {
  translate: translator as (
    key: string,
    values?: Record<string, string | number>,
  ) => string,
  locale: LOCALE,
  formatNumber: formatter.number,
};

const ENTITY_TYPE_BY_ACTION: Record<AuditAction, AuditEntityType> = {
  FLEET_CREATED: AuditEntityType.FLEET,
  VEHICLE_CREATED: AuditEntityType.VEHICLE,
  VEHICLE_UPDATED: AuditEntityType.VEHICLE,
  VEHICLE_DELETED: AuditEntityType.VEHICLE,
  CALCULATION_CREATED: AuditEntityType.CALCULATION,
  ACCESS_DENIED: AuditEntityType.FLEET,
  MEMBERSHIP_ADDED: AuditEntityType.MEMBERSHIP,
  MEMBERSHIP_ROLE_UPDATED: AuditEntityType.MEMBERSHIP,
  MEMBERSHIP_REMOVED: AuditEntityType.MEMBERSHIP,
  INVITATION_CREATED: AuditEntityType.INVITATION,
  INVITATION_CLAIMED: AuditEntityType.INVITATION,
  INVITATION_CANCELED: AuditEntityType.INVITATION,
};

function buildEvent(
  action: AuditAction,
  overrides: Partial<ActivityEvent> = {},
): ActivityEvent {
  return {
    id: "event_1",
    action,
    entityType: ENTITY_TYPE_BY_ACTION[action],
    metadata: { role: "MANAGER" },
    createdAt: "2026-10-05T09:42:00.000Z",
    actorUser: {
      id: "user_1",
      email: "mira@example.com",
      name: "Mira Hoffmann",
    },
    subjectName: "Scania R450",
    ...overrides,
  };
}

describe("activity sentences", () => {
  it.each(Object.values(AuditAction))(
    "has a message for %s that renders without raw enum names",
    (action) => {
      expect(ACTIVITY_MESSAGE_KEYS[action]).toBeDefined();

      const sentences = buildActivitySentences(
        buildEvent(action),
        formatContext,
      );

      expect(sentences.length).toBeGreaterThan(0);
      sentences.forEach((sentence) => {
        expect(sentence).not.toMatch(RAW_ENUM_NAME_PATTERN);
        expect(sentence).toContain("Mira Hoffmann");
      });
    },
  );

  it("maps every action to a different message", () => {
    const messageKeys = Object.values(ACTIVITY_MESSAGE_KEYS);

    expect(new Set(messageKeys).size).toBe(messageKeys.length);
  });

  it("describes a changed field with its old and new value", () => {
    const event = buildEvent(AuditAction.VEHICLE_UPDATED, {
      metadata: {
        changes: [{ field: "averageDailyDistanceKm", from: 180, to: 220 }],
      },
    });

    expect(buildActivitySentences(event, formatContext)).toEqual([
      "Mira Hoffmann changed daily distance for Scania R450 from 180 km to 220 km",
    ]);
  });

  it("writes one sentence for each changed field", () => {
    const event = buildEvent(AuditAction.VEHICLE_UPDATED, {
      metadata: {
        changes: [
          { field: "city", from: "Berlin", to: "Hamburg" },
          { field: "winterUsage", from: false, to: true },
        ],
      },
    });

    expect(buildActivitySentences(event, formatContext)).toEqual([
      "Mira Hoffmann changed city for Scania R450 from Berlin to Hamburg",
      "Mira Hoffmann changed winter use for Scania R450 from No to Yes",
    ]);
  });

  it("names option values in words instead of enum names", () => {
    const event = buildEvent(AuditAction.VEHICLE_UPDATED, {
      metadata: {
        changes: [{ field: "parkingType", from: "CUSTOMER_SITE", to: "DEPOT" }],
      },
    });

    expect(buildActivitySentences(event, formatContext)).toEqual([
      "Mira Hoffmann changed parking place for Scania R450 from At customer sites to At our depot",
    ]);
  });

  it.each([
    ["no changes were stored", {}],
    ["the changes are empty", { changes: [] }],
    [
      "the changed field is unknown",
      { changes: [{ field: "unknown", from: 1, to: 2 }] },
    ],
  ])("falls back to a general sentence when %s", (_, metadata) => {
    const event = buildEvent(AuditAction.VEHICLE_UPDATED, { metadata });

    expect(buildActivitySentences(event, formatContext)).toEqual([
      "Mira Hoffmann edited Scania R450",
    ]);
  });

  it("names the role in team sentences", () => {
    const event = buildEvent(AuditAction.MEMBERSHIP_ROLE_UPDATED, {
      subjectName: "Carol",
    });

    expect(buildActivitySentences(event, formatContext)).toEqual([
      "Mira Hoffmann changed the role of Carol to Manager",
    ]);
  });

  it("uses plain words when the actor or subject is unknown", () => {
    const event = buildEvent(AuditAction.VEHICLE_DELETED, {
      actorUser: null,
      subjectName: null,
    });

    expect(buildActivitySentences(event, formatContext)).toEqual([
      "Someone removed a vehicle",
    ]);
  });
});
