import { prisma } from "@/lib/prisma";
import { createCalculationForVehicle } from "@/lib/calculation-service";
import { loadFleetCalculationHistory } from "@/lib/fleet-calculation-history";
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

describe("loading the fleet calculation history", () => {
  it("returns calculations newest first with the realistic payback", async () => {
    const first = await calculateFor(fixtures.vehicleA);
    const second = await calculateFor(fixtures.vehicleA);

    const history = await loadFleetCalculationHistory(fixtures.fleetA.id);

    expect(history.map(({ id }) => id)).toEqual([second.id, first.id]);
    expect(history[0]).toMatchObject({
      manufacturer: fixtures.vehicleA.manufacturer,
      model: fixtures.vehicleA.model,
      hasResult: true,
      assumptionSetVersion: expect.any(String),
    });
  });

  it("leaves out other fleets and deleted vehicles", async () => {
    await calculateFor(fixtures.vehicleA);
    await prisma.vehicle.update({
      where: { id: fixtures.vehicleA.id },
      data: { deletedAt: new Date() },
    });

    expect(await loadFleetCalculationHistory(fixtures.fleetA.id)).toEqual([]);
    expect(await loadFleetCalculationHistory(fixtures.fleetB.id)).toEqual([]);
  });
});
