import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate } from "@/lib/calculation-engine";
import { CENTS_PER_EURO } from "@/lib/calculation-engine/constants";
import { HOME_EXAMPLE_QUICK_CHECK } from "@/lib/home-example";
import { getHomeShowcase } from "@/lib/home-showcase";
import { quickCheckToCalculationInput } from "@/lib/quick-check-mapping";

describe("home showcase", () => {
  it("takes the result figures from the calculation engine", () => {
    const realistic = calculate(
      quickCheckToCalculationInput(HOME_EXAMPLE_QUICK_CHECK, ASSUMPTION_SET_V1),
      ASSUMPTION_SET_V1,
    ).scenarios.REALISTIC;

    expect(getHomeShowcase().result.verdict.annualSavingsEuros).toBe(
      realistic.annualSavingsCents / CENTS_PER_EURO,
    );
  });

  it("totals only the calculated groups", () => {
    const { groups, kpis, vehicleCount } = getHomeShowcase();
    const calculatedGroups = groups.filter(({ isCalculated }) => isCalculated);

    expect(kpis.calculatedGroupCount).toBe(calculatedGroups.length);
    expect(kpis.notCalculatedYetCount).toBe(
      groups.length - calculatedGroups.length,
    );
    expect(kpis.notCalculatedYetCount).toBeGreaterThan(0);
    expect(kpis.couldSaveEurosPerYear).toBeGreaterThan(0);
    expect(vehicleCount).toBe(
      groups.reduce((total, { quantity }) => total + quantity, 0),
    );
  });

  it("builds the showcase once and reuses it", () => {
    expect(getHomeShowcase()).toBe(getHomeShowcase());
  });
});
