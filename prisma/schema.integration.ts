import "dotenv/config";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { after, before, describe, it } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const sourceUrl = new URL(process.env.DATABASE_URL as string);
const testDatabaseName = `${sourceUrl.pathname.slice(1)}_test`;

const adminUrl = new URL(sourceUrl);
adminUrl.pathname = "/postgres";

const testUrl = new URL(sourceUrl);
testUrl.pathname = `/${testDatabaseName}`;

let prisma: PrismaClient;

async function withAdminConnection<T>(run: (admin: Client) => Promise<T>) {
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    return await run(admin);
  } finally {
    await admin.end();
  }
}

async function terminateActiveConnectionsToTestDatabase(admin: Client) {
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [testDatabaseName],
  );
}

async function createFreshTestDatabase() {
  await withAdminConnection(async (admin) => {
    await terminateActiveConnectionsToTestDatabase(admin);
    await admin.query(`DROP DATABASE IF EXISTS "${testDatabaseName}"`);
    await admin.query(`CREATE DATABASE "${testDatabaseName}"`);
  });
}

async function dropTestDatabase() {
  await withAdminConnection(async (admin) => {
    await terminateActiveConnectionsToTestDatabase(admin);
    await admin.query(`DROP DATABASE IF EXISTS "${testDatabaseName}"`);
  });
}

before(
  async () => {
    await createFreshTestDatabase();

    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: testUrl.toString() },
      stdio: "pipe",
    });

    const adapter = new PrismaPg({ connectionString: testUrl.toString() });
    prisma = new PrismaClient({ adapter });
  },
  { timeout: 30000 },
);

after(
  async () => {
    await prisma?.$disconnect();
    await dropTestDatabase();
  },
  { timeout: 30000 },
);

async function seedVehicleWithCalculation(fixtureLabel: string) {
  const user = await prisma.user.create({
    data: { email: `vehicle-owner-${fixtureLabel}@example.com` },
  });
  const fleet = await prisma.fleet.create({
    data: { name: `Delivery Fleet ${fixtureLabel}`, type: "VAN" },
  });
  const vehicle = await prisma.vehicle.create({
    data: {
      fleetId: fleet.id,
      manufacturer: "Ford",
      model: "E-Transit",
      vehicleType: "VAN",
      engineType: "ELECTRIC",
      parkingType: "DEPOT",
      quantity: 1,
      averageDailyDistanceKm: 100,
      energyConsumptionKwhPer100km: 20,
      solarPanelCapacityKw: 1,
      solarPanelPlacement: "ROOF",
      payloadReserveKg: 300,
      maxRoofLoadKg: 100,
      operatingMonthsPerYear: 12,
      winterUsage: true,
      city: "Berlin",
      country: "Germany",
    },
  });
  const calculation = await prisma.calculation.create({
    data: {
      fleetId: fleet.id,
      vehicleId: vehicle.id,
      requestedByUserId: user.id,
    },
  });
  return { user, fleet, vehicle, calculation };
}

async function deleteVehicleFixture(
  fixture: Awaited<ReturnType<typeof seedVehicleWithCalculation>>,
) {
  await prisma.calculation.deleteMany({
    where: { id: fixture.calculation.id },
  });
  await prisma.vehicle.deleteMany({ where: { id: fixture.vehicle.id } });
  await prisma.fleet.deleteMany({ where: { id: fixture.fleet.id } });
  await prisma.user.deleteMany({ where: { id: fixture.user.id } });
}

describe("database migrations", () => {
  it("apply cleanly to an empty database, leaving every domain table queryable", async () => {
    const [
      fleets,
      vehicles,
      calculations,
      reportJobs,
      auditEvents,
      featureFlags,
    ] = await Promise.all([
      prisma.fleet.findMany(),
      prisma.vehicle.findMany(),
      prisma.calculation.findMany(),
      prisma.reportJob.findMany(),
      prisma.auditEvent.findMany(),
      prisma.featureFlag.findMany(),
    ]);

    assert.deepEqual(fleets, []);
    assert.deepEqual(vehicles, []);
    assert.deepEqual(calculations, []);
    assert.deepEqual(reportJobs, []);
    assert.deepEqual(auditEvents, []);
    assert.deepEqual(featureFlags, []);
  });
});

describe("fleet-scoped unique constraints", () => {
  it("allows the same user to hold a membership in two different fleets", async () => {
    const user = await prisma.user.create({
      data: { email: "shared-user@example.com" },
    });
    const fleetOne = await prisma.fleet.create({
      data: { name: "Fleet One", type: "VAN" },
    });
    const fleetTwo = await prisma.fleet.create({
      data: { name: "Fleet Two", type: "TRUCK" },
    });

    try {
      await prisma.fleetMembership.create({
        data: { fleetId: fleetOne.id, userId: user.id, role: "OWNER" },
      });
      await prisma.fleetMembership.create({
        data: { fleetId: fleetTwo.id, userId: user.id, role: "VIEWER" },
      });

      const memberships = await prisma.fleetMembership.findMany({
        where: { userId: user.id },
      });
      assert.equal(memberships.length, 2);
    } finally {
      await prisma.user.deleteMany({ where: { id: user.id } });
      await prisma.fleet.deleteMany({
        where: { id: { in: [fleetOne.id, fleetTwo.id] } },
      });
    }
  });

  it("rejects a duplicate membership for the same fleet and user", async () => {
    const user = await prisma.user.create({
      data: { email: "duplicate-user@example.com" },
    });
    const fleet = await prisma.fleet.create({
      data: { name: "Solo Fleet", type: "VAN" },
    });

    try {
      await prisma.fleetMembership.create({
        data: { fleetId: fleet.id, userId: user.id, role: "OWNER" },
      });

      await assert.rejects(() =>
        prisma.fleetMembership.create({
          data: { fleetId: fleet.id, userId: user.id, role: "VIEWER" },
        }),
      );
    } finally {
      await prisma.user.deleteMany({ where: { id: user.id } });
      await prisma.fleet.deleteMany({ where: { id: fleet.id } });
    }
  });
});

describe("vehicle deletion preserves calculation history", () => {
  it("blocks hard-deleting a vehicle that still has calculations", async () => {
    const fixture = await seedVehicleWithCalculation("hard-delete");

    try {
      await assert.rejects(() =>
        prisma.vehicle.delete({ where: { id: fixture.vehicle.id } }),
      );
    } finally {
      await deleteVehicleFixture(fixture);
    }
  });

  it("preserves the calculation when the vehicle is soft-deleted instead", async () => {
    const fixture = await seedVehicleWithCalculation("soft-delete");

    try {
      await prisma.vehicle.update({
        where: { id: fixture.vehicle.id },
        data: { deletedAt: new Date() },
      });

      const preservedCalculation = await prisma.calculation.findUnique({
        where: { id: fixture.calculation.id },
      });
      assert.notEqual(preservedCalculation, null);

      const softDeletedVehicle = await prisma.vehicle.findUnique({
        where: { id: fixture.vehicle.id },
      });
      assert.notEqual(softDeletedVehicle?.deletedAt, null);
    } finally {
      await deleteVehicleFixture(fixture);
    }
  });
});
