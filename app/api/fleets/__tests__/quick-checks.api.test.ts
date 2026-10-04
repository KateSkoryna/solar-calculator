import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@/lib/audit";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate } from "@/lib/calculation-engine";
import { quickCheckToCalculationInput } from "@/lib/quick-check-mapping";
import type { QuickCheckAnswers } from "@/lib/quick-check-schema";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";
import { POST as saveQuickCheck } from "../[fleetId]/quick-checks/route";

jest.mock("@/auth", () => ({ auth: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;
const FORGED_PAYBACK_MONTHS = 1;

const answers: QuickCheckAnswers = {
  vehicleType: "TRUCK",
  quantity: 4,
  cargoType: "CHILLED",
  distanceBand: "REGIONAL",
  idlingFrequency: "SOMETIMES",
  cityLabel: "Berlin",
  countryCode: "DE",
  latitude: 52.52,
  longitude: 13.405,
  parkingType: "DEPOT",
  solarPanelPlacement: "ROOF",
};

let fixtures: FleetFixtures;

function signInAs(user: { id: string }) {
  mockedAuth.mockResolvedValue({
    user: { id: user.id },
    expires: new Date(Date.now() + 60_000).toISOString(),
  });
}

function postQuickCheck(body: unknown, fleetId = fixtures.fleetA.id) {
  return saveQuickCheck(
    new Request("http://localhost/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ fleetId }) },
  );
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
  signInAs(fixtures.ownerA);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/fleets/[fleetId]/quick-checks", () => {
  it("creates one vehicle and one calculation on the first save", async () => {
    const vehiclesBefore = await prisma.vehicle.count();
    const calculationsBefore = await prisma.calculation.count();

    const response = await postQuickCheck(answers);
    const { calculation } = await response.json();

    expect(response.status).toBe(201);
    expect(calculation.scenarios).toHaveLength(3);
    expect(await prisma.vehicle.count()).toBe(vehiclesBefore + 1);
    expect(await prisma.calculation.count()).toBe(calculationsBefore + 1);
    expect(
      await prisma.auditEvent.count({
        where: { action: AuditAction.VEHICLE_CREATED },
      }),
    ).toBe(1);
    expect(
      await prisma.auditEvent.count({
        where: { action: AuditAction.CALCULATION_CREATED },
      }),
    ).toBe(1);
  });

  it("returns the existing calculation for an identical second save", async () => {
    const first = await (await postQuickCheck(answers)).json();
    const vehiclesAfterFirst = await prisma.vehicle.count();
    const calculationsAfterFirst = await prisma.calculation.count();

    const secondResponse = await postQuickCheck(answers);
    const second = await secondResponse.json();

    expect(secondResponse.status).toBe(200);
    expect(second.calculation.id).toBe(first.calculation.id);
    expect(await prisma.vehicle.count()).toBe(vehiclesAfterFirst);
    expect(await prisma.calculation.count()).toBe(calculationsAfterFirst);
  });

  it("treats answers with a different key order as the same quick check", async () => {
    const first = await (await postQuickCheck(answers)).json();
    const reordered = Object.fromEntries(Object.entries(answers).reverse());

    const second = await (await postQuickCheck(reordered)).json();

    expect(second.calculation.id).toBe(first.calculation.id);
  });

  it("ignores extra result fields in the body", async () => {
    const response = await postQuickCheck({
      ...answers,
      paybackPeriodMonths: FORGED_PAYBACK_MONTHS,
      result: { paybackPeriodMonths: FORGED_PAYBACK_MONTHS },
    });
    const { calculation } = await response.json();

    const expected = calculate(
      quickCheckToCalculationInput(answers, ASSUMPTION_SET_V1),
      ASSUMPTION_SET_V1,
    );
    const realistic = calculation.scenarios.find(
      (scenario: { kind: string }) => scenario.kind === "REALISTIC",
    );

    expect(response.status).toBe(201);
    expect(realistic.result.paybackPeriodMonths).toBe(
      expected.scenarios.REALISTIC.paybackMonths,
    );
    expect(realistic.result.paybackPeriodMonths).not.toBe(
      FORGED_PAYBACK_MONTHS,
    );
  });

  it("rejects a viewer with 403", async () => {
    signInAs(fixtures.viewerA);

    const response = await postQuickCheck(answers);

    expect(response.status).toBe(403);
  });

  it("rejects a non-EU country with 400", async () => {
    const response = await postQuickCheck({ ...answers, countryCode: "US" });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/fleets/[fleetId]/quick-checks after the vehicle was deleted", () => {
  it("creates a fresh vehicle and calculation", async () => {
    const first = await (await postQuickCheck(answers)).json();
    await prisma.vehicle.updateMany({
      where: { id: first.calculation.vehicleId },
      data: { deletedAt: new Date() },
    });

    const response = await postQuickCheck(answers);
    const second = await response.json();

    expect(response.status).toBe(201);
    expect(second.calculation.id).not.toBe(first.calculation.id);
    expect(second.calculation.vehicleId).not.toBe(first.calculation.vehicleId);
  });
});
