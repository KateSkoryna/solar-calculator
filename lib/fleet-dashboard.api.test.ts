import { prisma } from "@/lib/prisma";
import { createCalculationForVehicle } from "@/lib/calculation-service";
import { loadFleetDashboardData } from "@/lib/fleet-dashboard";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";

let fixtures: FleetFixtures;

function calculateFor(vehicle: FleetFixtures["vehicleA"]) {
  return prisma.$transaction((transaction) =>
    createCalculationForVehicle(transaction, {
      fleetId: vehicle.fleetId,
      vehicle,
      requestedByUserId: fixtures.ownerA.id,
    }),
  );
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("loading the fleet dashboard data", () => {
  it("returns a vehicle without a calculation as a group with no result", async () => {
    const groups = await loadFleetDashboardData(fixtures.fleetA.id);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      vehicleId: fixtures.vehicleA.id,
      latestCalculation: null,
    });
  });

  it("returns the latest realistic result for each vehicle", async () => {
    await calculateFor(fixtures.vehicleA);
    const latest = await calculateFor(fixtures.vehicleA);

    const [group] = await loadFleetDashboardData(fixtures.fleetA.id);

    expect(group.latestCalculation?.id).toBe(latest.id);
    expect(group.latestCalculation?.annualSavingsEuros).toBeGreaterThan(0);
    expect(group.latestCalculation?.assumptionSetVersion).toEqual(
      expect.any(String),
    );
  });

  it("leaves out deleted vehicles and other fleets' vehicles", async () => {
    await prisma.vehicle.update({
      where: { id: fixtures.vehicleA.id },
      data: { deletedAt: new Date() },
    });

    expect(await loadFleetDashboardData(fixtures.fleetA.id)).toEqual([]);
    const fleetBGroups = await loadFleetDashboardData(fixtures.fleetB.id);
    expect(fleetBGroups.map(({ vehicleId }) => vehicleId)).toEqual([
      fixtures.vehicleB.id,
    ]);
  });
});
