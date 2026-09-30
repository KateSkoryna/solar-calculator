import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@/lib/audit";
import {
  GET as listVehicles,
  POST as createVehicle,
} from "../[fleetId]/vehicles/route";
import {
  GET as getVehicle,
  PATCH as updateVehicle,
  DELETE as deleteVehicle,
} from "../[fleetId]/vehicles/[vehicleId]/route";
import { POST as createCalculation } from "../[fleetId]/calculations/route";
import { POST as addMembership } from "../[fleetId]/members/route";
import {
  PATCH as changeMembership,
  DELETE as removeMembership,
} from "../[fleetId]/members/[userId]/route";
import {
  FleetFixtures,
  RIVAL_FLEET_VEHICLE_MANUFACTURER,
  resetDatabase,
  seedFleetFixtures,
  validVehicleInput,
} from "@/test-support/fixtures";

jest.mock("@/auth", () => ({ auth: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

let fixtures: FleetFixtures;

function signInAs(user: { id: string } | null) {
  mockedAuth.mockResolvedValue(
    user
      ? {
          user: { id: user.id },
          expires: new Date(Date.now() + 60_000).toISOString(),
        }
      : null,
  );
}

function jsonRequest(method: string, body?: unknown) {
  return new Request("http://localhost/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function routeParams<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("viewer permissions", () => {
  it("a viewer cannot create a vehicle", async () => {
    signInAs(fixtures.viewerA);

    const response = await createVehicle(
      jsonRequest("POST", validVehicleInput),
      routeParams({ fleetId: fixtures.fleetA.id }),
    );

    expect(response.status).toBe(403);
  });

  it("a viewer cannot update a vehicle", async () => {
    signInAs(fixtures.viewerA);

    const response = await updateVehicle(
      jsonRequest("PATCH", { city: "Munich" }),
      routeParams({
        fleetId: fixtures.fleetA.id,
        vehicleId: fixtures.vehicleA.id,
      }),
    );

    expect(response.status).toBe(403);
  });

  it("a viewer cannot delete a vehicle", async () => {
    signInAs(fixtures.viewerA);

    const response = await deleteVehicle(
      jsonRequest("DELETE"),
      routeParams({
        fleetId: fixtures.fleetA.id,
        vehicleId: fixtures.vehicleA.id,
      }),
    );

    expect(response.status).toBe(403);
  });

  it("a viewer cannot create a calculation", async () => {
    signInAs(fixtures.viewerA);

    const response = await createCalculation(
      jsonRequest("POST", { vehicleId: fixtures.vehicleA.id }),
      routeParams({ fleetId: fixtures.fleetA.id }),
    );

    expect(response.status).toBe(403);
  });
});

describe("manager permissions", () => {
  it("a manager cannot add a membership", async () => {
    signInAs(fixtures.managerA);

    const response = await addMembership(
      jsonRequest("POST", { email: "owner-b@example.com", role: "VIEWER" }),
      routeParams({ fleetId: fixtures.fleetA.id }),
    );

    expect(response.status).toBe(403);
  });

  it("a manager cannot change a membership", async () => {
    signInAs(fixtures.managerA);

    const response = await changeMembership(
      jsonRequest("PATCH", { role: "OWNER" }),
      routeParams({
        fleetId: fixtures.fleetA.id,
        userId: fixtures.viewerA.id,
      }),
    );

    expect(response.status).toBe(403);
  });

  it("a manager cannot remove a membership", async () => {
    signInAs(fixtures.managerA);

    const response = await removeMembership(
      jsonRequest("DELETE"),
      routeParams({
        fleetId: fixtures.fleetA.id,
        userId: fixtures.viewerA.id,
      }),
    );

    expect(response.status).toBe(403);
  });
});

describe("owner permissions", () => {
  it("an owner can add a membership", async () => {
    signInAs(fixtures.ownerA);

    const response = await addMembership(
      jsonRequest("POST", { email: "owner-b@example.com", role: "VIEWER" }),
      routeParams({ fleetId: fixtures.fleetA.id }),
    );

    expect(response.status).toBe(201);
  });
});

describe("fleet isolation", () => {
  it("a member of fleet A gets 403 on fleet B's vehicle list", async () => {
    signInAs(fixtures.ownerA);

    const response = await listVehicles(
      jsonRequest("GET"),
      routeParams({ fleetId: fixtures.fleetB.id }),
    );

    expect(response.status).toBe(403);
    expect(JSON.stringify(await response.json())).not.toContain(
      RIVAL_FLEET_VEHICLE_MANUFACTURER,
    );
  });

  it("fleet A's route with fleet B's vehicle ID returns 404 and leaks no data", async () => {
    signInAs(fixtures.ownerA);

    const response = await getVehicle(
      jsonRequest("GET"),
      routeParams({
        fleetId: fixtures.fleetA.id,
        vehicleId: fixtures.vehicleB.id,
      }),
    );

    const responseText = await response.text();
    expect(response.status).toBe(404);
    expect(responseText).not.toContain(RIVAL_FLEET_VEHICLE_MANUFACTURER);
    expect(responseText).not.toContain(fixtures.vehicleB.id);
    expect(responseText).not.toContain(fixtures.vehicleB.city);
  });
});

describe("authentication", () => {
  it("a request without a session is rejected", async () => {
    signInAs(null);

    const response = await listVehicles(
      jsonRequest("GET"),
      routeParams({ fleetId: fixtures.fleetA.id }),
    );

    expect(response.status).toBe(403);
  });
});

describe("audit events", () => {
  it("a successful vehicle creation writes exactly one VEHICLE_CREATED audit event", async () => {
    signInAs(fixtures.ownerA);

    const response = await createVehicle(
      jsonRequest("POST", validVehicleInput),
      routeParams({ fleetId: fixtures.fleetA.id }),
    );

    const auditEvents = await prisma.auditEvent.findMany();
    expect(response.status).toBe(201);
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]).toMatchObject({
      action: AuditAction.VEHICLE_CREATED,
      fleetId: fixtures.fleetA.id,
      actorUserId: fixtures.ownerA.id,
    });
  });

  it("a rejected request writes one ACCESS_DENIED audit event with the reason", async () => {
    signInAs(fixtures.viewerA);

    await createVehicle(
      jsonRequest("POST", validVehicleInput),
      routeParams({ fleetId: fixtures.fleetA.id }),
    );

    const auditEvents = await prisma.auditEvent.findMany();
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]).toMatchObject({
      action: AuditAction.ACCESS_DENIED,
      fleetId: fixtures.fleetA.id,
      actorUserId: fixtures.viewerA.id,
      metadata: { reason: "ROLE_NOT_ALLOWED", actualRole: "VIEWER" },
    });
  });
});
