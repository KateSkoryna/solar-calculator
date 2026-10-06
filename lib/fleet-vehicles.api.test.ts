import { prisma } from "@/lib/prisma";
import { loadFleetVehicles } from "@/lib/fleet-vehicles";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";

let fixtures: FleetFixtures;

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("loading the fleet vehicles", () => {
  it("returns only this fleet's active vehicles with their group name", async () => {
    await prisma.vehicle.update({
      where: { id: fixtures.vehicleA.id },
      data: { name: "Berlin delivery vans" },
    });

    const vehicles = await loadFleetVehicles(fixtures.fleetA.id);

    expect(vehicles.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: fixtures.vehicleA.id, name: "Berlin delivery vans" },
    ]);
  });

  it("leaves out deleted vehicles", async () => {
    await prisma.vehicle.update({
      where: { id: fixtures.vehicleA.id },
      data: { deletedAt: new Date() },
    });

    expect(await loadFleetVehicles(fixtures.fleetA.id)).toEqual([]);
  });
});
