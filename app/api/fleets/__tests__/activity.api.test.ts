import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction, AuditEntityType } from "@/lib/audit";
import { PATCH as updateVehicle } from "../[fleetId]/vehicles/[vehicleId]/route";
import { GET as listAuditEvents } from "../[fleetId]/audit-events/route";
import { POST as addMembership } from "../[fleetId]/members/route";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";

jest.mock("@/auth", () => ({ auth: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

const DISTANCE_BEFORE_KM = 180;
const DISTANCE_AFTER_KM = 220;

let fixtures: FleetFixtures;

function signInAs(user: { id: string }) {
  mockedAuth.mockResolvedValue({
    user: { id: user.id },
    expires: new Date(Date.now() + 60_000).toISOString(),
  });
}

function routeParams<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

function patchVehicle(body: unknown) {
  return updateVehicle(
    new Request("http://localhost/api", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    routeParams({
      fleetId: fixtures.fleetA.id,
      vehicleId: fixtures.vehicleA.id,
    }),
  );
}

async function fetchActivity(query = "") {
  const response = await listAuditEvents(
    new Request(`http://localhost/api?${query}`),
    routeParams({ fleetId: fixtures.fleetA.id }),
  );
  return response.json();
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
  await prisma.vehicle.update({
    where: { id: fixtures.vehicleA.id },
    data: { averageDailyDistanceKm: DISTANCE_BEFORE_KM },
  });
  signInAs(fixtures.ownerA);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("recording what a vehicle update changed", () => {
  it("stores the old and new value of the changed field", async () => {
    await patchVehicle({ averageDailyDistanceKm: DISTANCE_AFTER_KM });

    const event = await prisma.auditEvent.findFirstOrThrow({
      where: { action: AuditAction.VEHICLE_UPDATED },
    });

    expect(event.metadata).toEqual({
      changes: [
        {
          field: "averageDailyDistanceKm",
          from: DISTANCE_BEFORE_KM,
          to: DISTANCE_AFTER_KM,
        },
      ],
    });
  });

  it("leaves out fields that kept their value", async () => {
    await patchVehicle({
      averageDailyDistanceKm: DISTANCE_BEFORE_KM,
      city: "Munich",
    });

    const event = await prisma.auditEvent.findFirstOrThrow({
      where: { action: AuditAction.VEHICLE_UPDATED },
    });

    expect(event.metadata).toEqual({
      changes: [{ field: "city", from: fixtures.vehicleA.city, to: "Munich" }],
    });
  });
});

describe("listing activity for the team page", () => {
  it("names the vehicle an event is about and who did it", async () => {
    await patchVehicle({ averageDailyDistanceKm: DISTANCE_AFTER_KM });

    const { events } = await fetchActivity();

    expect(events[0]).toMatchObject({
      action: AuditAction.VEHICLE_UPDATED,
      subjectName: `${fixtures.vehicleA.manufacturer} ${fixtures.vehicleA.model}`,
      actorUser: { id: fixtures.ownerA.id },
    });
  });

  it("names the person a team event is about", async () => {
    await addMembership(
      new Request("http://localhost/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fixtures.ownerB.email,
          role: "VIEWER",
        }),
      }),
      routeParams({ fleetId: fixtures.fleetA.id }),
    );

    const { events } = await fetchActivity();

    expect(events[0]).toMatchObject({
      action: AuditAction.MEMBERSHIP_ADDED,
      subjectName: fixtures.ownerB.email,
    });
  });

  it("hides denied access attempts unless asked for", async () => {
    signInAs(fixtures.ownerB);
    await patchVehicle({ city: "Munich" });
    signInAs(fixtures.ownerA);

    const defaultView = await fetchActivity();
    const withDenied = await fetchActivity("includeAccessDenied=true");

    expect(
      defaultView.events.map(({ action }: { action: string }) => action),
    ).not.toContain(AuditAction.ACCESS_DENIED);
    expect(
      withDenied.events.map(({ action }: { action: string }) => action),
    ).toContain(AuditAction.ACCESS_DENIED);
  });

  it("filters by several entity types at once", async () => {
    await patchVehicle({ city: "Munich" });
    await prisma.auditEvent.create({
      data: {
        fleetId: fixtures.fleetA.id,
        actorUserId: fixtures.ownerA.id,
        action: AuditAction.FLEET_CREATED,
        entityType: AuditEntityType.FLEET,
        entityId: fixtures.fleetA.id,
        metadata: {},
      },
    });

    const { events } = await fetchActivity(
      "entityType=VEHICLE&entityType=MEMBERSHIP",
    );

    expect(
      events.map(({ entityType }: { entityType: string }) => entityType),
    ).toEqual([AuditEntityType.VEHICLE]);
  });
});
