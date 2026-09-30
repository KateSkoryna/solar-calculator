import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ScenarioKind } from "@/app/generated/prisma/enums";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate, FORMULA_VERSION } from "@/lib/calculation-engine";
import { toCalculationInput } from "@/lib/calculation-service";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";
import { POST as createCalculation } from "../[fleetId]/calculations/route";
import { GET as getCalculation } from "../[fleetId]/calculations/[calculationId]/route";

jest.mock("@/auth", () => ({ auth: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;
const FORGED_PAYBACK_MONTHS = 1;

let fixtures: FleetFixtures;

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

function postCalculation(body: unknown) {
  return createCalculation(
    jsonRequest("POST", body),
    routeParams({ fleetId: fixtures.fleetA.id }),
  );
}

async function countCalculationRows() {
  return {
    calculations: await prisma.calculation.count(),
    scenarios: await prisma.calculationScenario.count(),
    snapshots: await prisma.calculationInputSnapshot.count(),
    results: await prisma.calculationResult.count(),
  };
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
  mockedAuth.mockResolvedValue({
    user: { id: fixtures.ownerA.id },
    expires: new Date(Date.now() + 60_000).toISOString(),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("creating a calculation", () => {
  it("stores three scenarios with snapshots and results", async () => {
    const response = await postCalculation({ vehicleId: fixtures.vehicleA.id });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(
      body.calculation.scenarios.map(
        (scenario: { kind: string }) => scenario.kind,
      ),
    ).toEqual(expect.arrayContaining(Object.values(ScenarioKind)));
    expect(body.calculation.scenarios).toHaveLength(3);
    body.calculation.scenarios.forEach(
      (scenario: { result: unknown; formulaVersion: string }) => {
        expect(scenario.result).not.toBeNull();
        expect(scenario.formulaVersion).toBe(FORMULA_VERSION);
      },
    );
    expect(await countCalculationRows()).toEqual({
      calculations: 1,
      scenarios: 3,
      snapshots: 3,
      results: 3,
    });
  });

  it("keeps the resolved input and its sources in the snapshot", async () => {
    const response = await postCalculation({ vehicleId: fixtures.vehicleA.id });
    const { calculation } = await response.json();

    const snapshot = await prisma.calculationInputSnapshot.findFirstOrThrow({
      where: { calculationScenarioId: calculation.scenarios[0].id },
    });

    expect(snapshot.vehicleSpec).toEqual(
      expect.objectContaining({
        input: expect.objectContaining({ vehicleType: "VAN" }),
        inputSources: expect.objectContaining({ vehicleType: "PROVIDED" }),
      }),
    );
  });

  it("ignores result fields sent by the client", async () => {
    const response = await postCalculation({
      vehicleId: fixtures.vehicleA.id,
      paybackPeriodMonths: FORGED_PAYBACK_MONTHS,
      result: { paybackPeriodMonths: FORGED_PAYBACK_MONTHS },
    });
    const { calculation } = await response.json();

    const realisticScenario = calculation.scenarios.find(
      (scenario: { kind: string }) => scenario.kind === ScenarioKind.REALISTIC,
    );
    const expectedPayback = calculate(
      toCalculationInput(fixtures.vehicleA),
      ASSUMPTION_SET_V1,
    ).scenarios.REALISTIC.paybackMonths;

    expect(response.status).toBe(201);
    expect(realisticScenario.result.paybackPeriodMonths).toBeCloseTo(
      expectedPayback as number,
    );
    expect(realisticScenario.result.paybackPeriodMonths).not.toBe(
      FORGED_PAYBACK_MONTHS,
    );
  });

  it("leaves no rows behind when a write fails inside the transaction", async () => {
    const originalTransaction = prisma.$transaction.bind(prisma);
    jest.spyOn(prisma, "$transaction").mockImplementation(((
      callback: (tx: typeof prisma) => Promise<unknown>,
    ) =>
      originalTransaction((tx) => {
        const originalCreate = tx.calculationScenario.create.bind(
          tx.calculationScenario,
        );
        let createdScenarios = 0;
        tx.calculationScenario.create = ((args: never) => {
          createdScenarios += 1;
          if (createdScenarios === 3) throw new Error("result insert failed");
          return originalCreate(args);
        }) as typeof tx.calculationScenario.create;
        return callback(tx as unknown as typeof prisma);
      })) as never);

    const response = await postCalculation({ vehicleId: fixtures.vehicleA.id });

    expect(response.status).toBe(500);
    expect(await countCalculationRows()).toEqual({
      calculations: 0,
      scenarios: 0,
      snapshots: 0,
      results: 0,
    });
    expect(await prisma.auditEvent.count()).toBe(0);
  });
});

describe("reading a calculation", () => {
  it("returns every scenario with its result", async () => {
    const created = await (
      await postCalculation({ vehicleId: fixtures.vehicleA.id })
    ).json();

    const response = await getCalculation(
      jsonRequest("GET"),
      routeParams({
        fleetId: fixtures.fleetA.id,
        calculationId: created.calculation.id,
      }),
    );
    const { calculation } = await response.json();

    expect(response.status).toBe(200);
    expect(calculation.scenarios).toHaveLength(3);
    calculation.scenarios.forEach((scenario: { result: unknown }) =>
      expect(scenario.result).not.toBeNull(),
    );
  });
});
