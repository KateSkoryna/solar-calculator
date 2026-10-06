import { VehicleType } from "@/app/generated/prisma/enums";
import {
  aggregateFleetKpis,
  type FleetVehicleGroup,
  type GroupCalculation,
} from "@/lib/fleet-dashboard";

const CURRENT_VERSION = "2026.1";
const OLD_VERSION = "2025.2";

function calculation(
  overrides: Partial<GroupCalculation> = {},
): GroupCalculation {
  return {
    id: "calc_1",
    assumptionSetVersion: CURRENT_VERSION,
    paybackMonths: 60,
    annualSavingsEuros: 1000,
    co2AvoidedKgPerYear: 500,
    ...overrides,
  };
}

function group(
  quantity: number,
  latestCalculation: GroupCalculation | null,
): FleetVehicleGroup {
  return {
    vehicleId: `vehicle_${quantity}_${latestCalculation?.id ?? "none"}`,
    manufacturer: "Ford",
    model: "Transit",
    vehicleType: VehicleType.VAN,
    city: "Berlin",
    quantity,
    latestCalculation,
  };
}

describe("aggregateFleetKpis", () => {
  it("reports nothing for an empty fleet", () => {
    expect(aggregateFleetKpis([], CURRENT_VERSION)).toEqual({
      couldSaveEurosPerYear: 0,
      averagePaybackMonths: null,
      co2AvoidedKgPerYear: 0,
      calculatedGroupCount: 0,
      groupsWithoutPaybackCount: 0,
      notCalculatedYetCount: 0,
    });
  });

  it("sums savings and CO2 for groups calculated with the current assumptions", () => {
    const kpis = aggregateFleetKpis(
      [
        group(1, calculation({ id: "a", annualSavingsEuros: 1200 })),
        group(2, calculation({ id: "b", annualSavingsEuros: 800 })),
      ],
      CURRENT_VERSION,
    );

    expect(kpis.couldSaveEurosPerYear).toBe(2000);
    expect(kpis.co2AvoidedKgPerYear).toBe(1000);
    expect(kpis.calculatedGroupCount).toBe(2);
    expect(kpis.notCalculatedYetCount).toBe(0);
  });

  it("leaves groups calculated with an older assumption set out of the numbers and counts them as not calculated", () => {
    const kpis = aggregateFleetKpis(
      [
        group(1, calculation({ id: "current", annualSavingsEuros: 1000 })),
        group(
          1,
          calculation({
            id: "stale",
            assumptionSetVersion: OLD_VERSION,
            annualSavingsEuros: 9999,
          }),
        ),
      ],
      CURRENT_VERSION,
    );

    expect(kpis.couldSaveEurosPerYear).toBe(1000);
    expect(kpis.calculatedGroupCount).toBe(1);
    expect(kpis.notCalculatedYetCount).toBe(1);
  });

  it("counts a group without any calculation as not calculated yet", () => {
    const kpis = aggregateFleetKpis(
      [group(3, null), group(1, calculation())],
      CURRENT_VERSION,
    );

    expect(kpis.notCalculatedYetCount).toBe(1);
    expect(kpis.calculatedGroupCount).toBe(1);
  });

  it("weights the average payback by the number of vehicles", () => {
    const kpis = aggregateFleetKpis(
      [
        group(1, calculation({ id: "a", paybackMonths: 100 })),
        group(9, calculation({ id: "b", paybackMonths: 20 })),
      ],
      CURRENT_VERSION,
    );

    expect(kpis.averagePaybackMonths).toBeCloseTo(28);
  });

  it("leaves a group that never pays back out of the average and counts it separately", () => {
    const kpis = aggregateFleetKpis(
      [
        group(1, calculation({ id: "a", paybackMonths: 48 })),
        group(5, calculation({ id: "b", paybackMonths: null })),
      ],
      CURRENT_VERSION,
    );

    expect(kpis.averagePaybackMonths).toBe(48);
    expect(kpis.groupsWithoutPaybackCount).toBe(1);
    expect(kpis.calculatedGroupCount).toBe(2);
  });

  it("has no average payback when no calculated group pays back", () => {
    const kpis = aggregateFleetKpis(
      [group(2, calculation({ paybackMonths: null }))],
      CURRENT_VERSION,
    );

    expect(kpis.averagePaybackMonths).toBeNull();
  });
});
