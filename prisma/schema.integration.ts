import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { ScenarioKind } from "@/app/generated/prisma/enums";
import {
  createFreshTestDatabase,
  dropTestDatabase,
  getTestDatabaseUrl,
} from "@/test-support/test-database";

let prisma: PrismaClient;

before(
  async () => {
    await createFreshTestDatabase();

    const adapter = new PrismaPg({ connectionString: getTestDatabaseUrl() });
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
    data: {
      name: `Delivery Fleet ${fixtureLabel}`,
      slug: `delivery-fleet-${fixtureLabel}`,
      type: "VAN",
    },
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
      data: { name: "Fleet One", slug: "fleet-one", type: "VAN" },
    });
    const fleetTwo = await prisma.fleet.create({
      data: { name: "Fleet Two", slug: "fleet-two", type: "TRUCK" },
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
      data: { name: "Solo Fleet", slug: "solo-fleet", type: "VAN" },
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

describe("scenarios per calculation", () => {
  function scenarioData(calculationId: string, kind: ScenarioKind) {
    return {
      calculationId,
      kind,
      label: kind,
      formulaVersion: "1.0.0",
      assumptionSetVersion: "2026.1",
    };
  }

  it("rejects two scenarios of the same kind for one calculation", async () => {
    const fixture = await seedVehicleWithCalculation("duplicate-scenario");

    try {
      await prisma.calculationScenario.create({
        data: scenarioData(fixture.calculation.id, ScenarioKind.REALISTIC),
      });

      await assert.rejects(() =>
        prisma.calculationScenario.create({
          data: scenarioData(fixture.calculation.id, ScenarioKind.REALISTIC),
        }),
      );
    } finally {
      await deleteVehicleFixture(fixture);
    }
  });

  it("accepts one scenario of each kind for one calculation", async () => {
    const fixture = await seedVehicleWithCalculation("three-scenarios");

    try {
      for (const kind of Object.values(ScenarioKind)) {
        await prisma.calculationScenario.create({
          data: scenarioData(fixture.calculation.id, kind),
        });
      }

      const scenarios = await prisma.calculationScenario.findMany({
        where: { calculationId: fixture.calculation.id },
      });
      assert.equal(scenarios.length, Object.values(ScenarioKind).length);
    } finally {
      await deleteVehicleFixture(fixture);
    }
  });
});
