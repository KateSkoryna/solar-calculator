import { prisma } from "@/lib/prisma";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate } from "@/lib/calculation-engine";
import {
  createCalculationForVehicle,
  toCalculationInput,
} from "@/lib/calculation-service";
import { ForbiddenError } from "@/lib/fleet-auth";
import { loadFleetCalculation } from "@/lib/fleet-calculation-loader";
import {
  storedCalculationToEngineOutput,
  toResultsViewModel,
} from "@/lib/results-view-model";
import { toProvenanceDetails } from "@/lib/stored-calculation";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";

const UNKNOWN_CALCULATION_ID = "calc_does_not_exist";
const UNKNOWN_FLEET_SLUG = "no-such-fleet";

let fixtures: FleetFixtures;
let calculationId: string;

function sessionFor(userId: string) {
  return {
    user: { id: userId },
    expires: new Date(Date.now() + 60_000).toISOString(),
  };
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
  const calculation = await prisma.$transaction((transaction) =>
    createCalculationForVehicle(transaction, {
      fleetId: fixtures.fleetA.id,
      vehicle: fixtures.vehicleA,
      requestedByUserId: fixtures.ownerA.id,
    }),
  );
  calculationId = calculation.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("loading a fleet calculation for its page", () => {
  it("returns the calculation to a member of the fleet", async () => {
    const calculation = await loadFleetCalculation(
      sessionFor(fixtures.viewerA.id),
      fixtures.fleetA.slug,
      calculationId,
    );

    expect(calculation?.scenarios).toHaveLength(3);
    expect(calculation?.requestedByUser.email).toBe(fixtures.ownerA.email);
  });

  it("refuses a user from another fleet", async () => {
    await expect(
      loadFleetCalculation(
        sessionFor(fixtures.ownerB.id),
        fixtures.fleetA.slug,
        calculationId,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("refuses a signed-out visitor", async () => {
    await expect(
      loadFleetCalculation(null, fixtures.fleetA.slug, calculationId),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("finds nothing for a calculation id that belongs to another fleet", async () => {
    const calculation = await loadFleetCalculation(
      sessionFor(fixtures.ownerB.id),
      fixtures.fleetB.slug,
      calculationId,
    );

    expect(calculation).toBeNull();
  });

  it("finds nothing for an unknown calculation or fleet", async () => {
    const session = sessionFor(fixtures.ownerA.id);

    expect(
      await loadFleetCalculation(
        session,
        fixtures.fleetA.slug,
        UNKNOWN_CALCULATION_ID,
      ),
    ).toBeNull();
    expect(
      await loadFleetCalculation(session, UNKNOWN_FLEET_SLUG, calculationId),
    ).toBeNull();
  });
});

describe("a saved result next to the live calculation", () => {
  it("shows exactly the same screen as running the engine again", async () => {
    const stored = await loadFleetCalculation(
      sessionFor(fixtures.ownerA.id),
      fixtures.fleetA.slug,
      calculationId,
    );
    const liveOutput = calculate(
      toCalculationInput(fixtures.vehicleA),
      ASSUMPTION_SET_V1,
    );

    expect(stored).not.toBeNull();
    expect(
      toResultsViewModel(storedCalculationToEngineOutput(stored!)),
    ).toEqual(toResultsViewModel(liveOutput));
  });

  it("names the requester and the assumptions used", async () => {
    const stored = await loadFleetCalculation(
      sessionFor(fixtures.ownerA.id),
      fixtures.fleetA.slug,
      calculationId,
    );

    expect(toProvenanceDetails(stored!)).toMatchObject({
      requestedBy: fixtures.ownerA.email,
      energyPriceVersion: ASSUMPTION_SET_V1.version,
    });
  });
});
