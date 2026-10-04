import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@/lib/audit";
import { Role } from "@/app/generated/prisma/enums";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";
import { GET as listFleets, POST as createFleet } from "../route";

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

function postFleet(body: unknown) {
  return createFleet(
    new Request("http://localhost/api/fleets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

function createUser(email: string, name: string | null = null) {
  return prisma.user.create({ data: { email, name } });
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/fleets", () => {
  it("creates the fleet, owner membership and audit event and sets the user name", async () => {
    const newUser = await createUser("new@example.com");
    signInAs(newUser);

    const response = await postFleet({
      companyName: "Nordwind",
      userName: "Kim Example",
    });
    const { fleet } = await response.json();

    expect(response.status).toBe(201);
    expect(fleet.slug).toBe("nordwind");

    const membership = await prisma.fleetMembership.findUniqueOrThrow({
      where: { fleetId_userId: { fleetId: fleet.id, userId: newUser.id } },
    });
    expect(membership.role).toBe(Role.OWNER);

    const auditEvent = await prisma.auditEvent.findFirstOrThrow({
      where: { fleetId: fleet.id, action: AuditAction.FLEET_CREATED },
    });
    expect(auditEvent.actorUserId).toBe(newUser.id);

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: newUser.id },
    });
    expect(updatedUser.name).toBe("Kim Example");
  });

  it("keeps an existing user name", async () => {
    const namedUser = await createUser("named@example.com", "Existing Name");
    signInAs(namedUser);

    await postFleet({ companyName: "Nordwind", userName: "Other Name" });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: namedUser.id },
    });
    expect(user.name).toBe("Existing Name");
  });

  it("gives two fleets with the same name different slugs", async () => {
    const firstUser = await createUser("first@example.com");
    const secondUser = await createUser("second@example.com");

    signInAs(firstUser);
    const first = await (await postFleet({ companyName: "Nordwind" })).json();
    signInAs(secondUser);
    const second = await (await postFleet({ companyName: "Nordwind" })).json();

    expect(first.fleet.slug).toBe("nordwind");
    expect(second.fleet.slug).toBe("nordwind-2");
  });

  it("rolls back everything when the membership insert fails", async () => {
    const newUser = await createUser("rollback@example.com");
    signInAs(newUser);
    const fleetsBefore = await prisma.fleet.count();
    const originalTransaction = prisma.$transaction.bind(prisma);
    jest.spyOn(prisma, "$transaction").mockImplementation(((
      callback: (tx: typeof prisma) => Promise<unknown>,
    ) =>
      originalTransaction((tx) => {
        tx.fleetMembership.create = (() => {
          throw new Error("membership insert failed");
        }) as typeof tx.fleetMembership.create;
        return callback(tx as unknown as typeof prisma);
      })) as never);

    const response = await postFleet({
      companyName: "Nordwind",
      userName: "Kim Example",
    });

    expect(response.status).toBe(500);
    expect(await prisma.fleet.count()).toBe(fleetsBefore);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: newUser.id },
    });
    expect(user.name).toBeNull();
  });

  it.each([{}, { companyName: "A" }, { companyName: "  " }])(
    "rejects a missing or too short company name: %j",
    async (body) => {
      signInAs(await createUser("invalid@example.com"));

      const response = await postFleet(body);

      expect(response.status).toBe(400);
    },
  );

  it("rejects a request without a session", async () => {
    signInAs(null);

    const response = await postFleet({ companyName: "Nordwind" });

    expect(response.status).toBe(401);
  });
});

describe("GET /api/fleets", () => {
  it("returns only the fleets of the caller", async () => {
    signInAs(fixtures.ownerA);

    const response = await listFleets();
    const { fleets } = await response.json();

    expect(response.status).toBe(200);
    expect(fleets).toEqual([
      {
        id: fixtures.fleetA.id,
        name: "Fleet A",
        slug: "fleet-a",
        role: Role.OWNER,
      },
    ]);
  });

  it("rejects a request without a session", async () => {
    signInAs(null);

    expect((await listFleets()).status).toBe(401);
  });
});
