import type { SavingsContext } from "@/lib/calculation-engine/types";
import type { AssumptionSet } from "@/lib/assumptions/v1";
import {
  allocateEnergy,
  annualYieldPerKwp,
  computeEnergyDemands,
  solarEnergyPerVehicleYear,
} from "@/lib/calculation-engine/energy";
import {
  annualMaintenanceCents,
  cumulativeSeries,
  oneTimeCostBeforeSubsidyCents,
  paybackMonths,
  subsidyCents,
} from "@/lib/calculation-engine/finance";
import {
  resolveInput,
  resolveInputSources,
} from "@/lib/calculation-engine/resolve-inputs";
import { alternatorFuelSavings } from "@/lib/calculation-engine/savings/alternator-fuel";
import {
  batteryBreakdownSavingsPerYear,
  batteryReplacementSavingsInYear,
} from "@/lib/calculation-engine/savings/battery-breakdowns";
import { coolingUnitFuelSavings } from "@/lib/calculation-engine/savings/cooling-unit-fuel";
import { directChargingSavings } from "@/lib/calculation-engine/savings/direct-charging";
import { lessIdlingSavings } from "@/lib/calculation-engine/savings/less-idling";
import { calculate, FORMULA_VERSION } from "@/lib/calculation-engine";
import type { ResolvedInput } from "@/lib/calculation-engine";
import {
  BASE_INPUT,
  constantAssumption,
  REAL_ASSUMPTIONS,
} from "@/lib/calculation-engine/test-fixtures";

const SIMPLE_LOCATION = {
  name: "Testville",
  countryCode: "DE",
  latitude: 52.5,
  longitude: 13.4,
  yield: { flat: constantAssumption(1000), vertical: constantAssumption(500) },
} as const;

const SIMPLE_SET: AssumptionSet = {
  ...REAL_ASSUMPTIONS,
  yieldLocations: [SIMPLE_LOCATION],
  placement: {
    ...REAL_ASSUMPTIONS.placement,
    ROOF: { verticalShare: constantAssumption(0) },
    SIDES: { verticalShare: constantAssumption(1) },
  },
  losses: {
    flatMounting: constantAssumption(0),
    soiling: constantAssumption(0),
    wiring: constantAssumption(0),
  },
  shading: {
    DEPOT: constantAssumption(1),
    STREET: constantAssumption(1),
    CUSTOMER_SITE: constantAssumption(1),
    MIXED: constantAssumption(1),
  },
  alternator: {
    dieselFuelPerKwh: constantAssumption(0.4),
    petrolFuelPerKwh: constantAssumption(0.5),
  },
  idling: {
    ...REAL_ASSUMPTIONS.idling,
    fuelPerIdleHour: constantAssumption(3),
    cabClimateDemandKw: constantAssumption(1),
  },
  batteryBreakdowns: {
    failureRatePerYear: {
      withoutSolar: constantAssumption(0.1),
      withSolar: constantAssumption(0.05),
    },
    costPerCallOutEur: constantAssumption(200),
    batteryPriceEur: constantAssumption(100),
    batteryLifeYears: {
      withoutSolar: constantAssumption(4),
      withSolar: constantAssumption(6),
    },
  },
  costs: {
    installedSystemCostPerKwp: constantAssumption(2000),
    annualMaintenancePerKwp: constantAssumption(20),
  },
};

const RESOLVED: ResolvedInput = {
  ...BASE_INPUT,
  countryCode: "DE",
  energyConsumptionKwhPer100km: 20,
  solarPanelCapacityKw: 1,
  payloadReserveKg: 100,
  maxRoofLoadKg: 100,
  idleHoursPerDay: 2,
};

const PRICES = {
  dieselPerLitre: 1.5,
  petrolPerLitre: 1.8,
  electricityPerKwh: 0.3,
};

function context(overrides: Partial<ResolvedInput> = {}): SavingsContext {
  return {
    assumptionSet: SIMPLE_SET,
    input: { ...RESOLVED, ...overrides },
    scenario: "REALISTIC",
    prices: PRICES,
  };
}

describe("solar energy", () => {
  it("1 kWp x 1000 kWh per kWp with no losses gives 1000 kWh", () => {
    expect(solarEnergyPerVehicleYear(SIMPLE_SET, RESOLVED, "REALISTIC")).toBe(
      1000,
    );
  });

  it("scales with operating months", () => {
    expect(
      solarEnergyPerVehicleYear(
        SIMPLE_SET,
        { ...RESOLVED, operatingMonthsPerYear: 6 },
        "REALISTIC",
      ),
    ).toBe(500);
  });

  it("uses the vertical yield for side panels", () => {
    const sidePanels = { ...RESOLVED, solarPanelPlacement: "SIDES" } as const;
    expect(annualYieldPerKwp(SIMPLE_SET, sidePanels, "REALISTIC")).toBe(500);
  });
});

describe("energy allocation", () => {
  it("serves cooling, then idling, then auxiliary, then direct charging", () => {
    const allocation = allocateEnergy(100, {
      coolingKwh: 30,
      idlingKwh: 20,
      auxiliaryKwh: 40,
      directChargingKwh: 50,
    });

    expect(allocation).toEqual({
      producedKwh: 100,
      coolingKwh: 30,
      idlingKwh: 20,
      auxiliaryKwh: 40,
      directChargingKwh: 10,
      wastedKwh: 0,
    });
  });

  it("gives earlier demands priority when energy is short", () => {
    const allocation = allocateEnergy(35, {
      coolingKwh: 30,
      idlingKwh: 20,
      auxiliaryKwh: 40,
      directChargingKwh: 0,
    });

    expect(allocation.coolingKwh).toBe(30);
    expect(allocation.idlingKwh).toBe(5);
    expect(allocation.auxiliaryKwh).toBe(0);
  });

  it("wastes energy above total demand", () => {
    const allocation = allocateEnergy(200, {
      coolingKwh: 30,
      idlingKwh: 20,
      auxiliaryKwh: 40,
      directChargingKwh: 0,
    });

    expect(allocation.wastedKwh).toBe(110);
  });
});

describe("energy demands", () => {
  it("has no direct charging demand for a diesel vehicle", () => {
    const demands = computeEnergyDemands(SIMPLE_SET, RESOLVED, "REALISTIC");
    expect(demands.directChargingKwh).toBe(0);
    expect(demands.auxiliaryKwh).toBeGreaterThan(0);
  });

  it("puts auxiliary load into direct charging for an electric vehicle", () => {
    const demands = computeEnergyDemands(
      SIMPLE_SET,
      { ...RESOLVED, engineType: "ELECTRIC" },
      "REALISTIC",
    );
    expect(demands.auxiliaryKwh).toBe(0);
    expect(demands.directChargingKwh).toBeGreaterThan(150 * 0.2 * 365);
  });

  it("has cab climate demand of hours x kW x operating days", () => {
    const demands = computeEnergyDemands(SIMPLE_SET, RESOLVED, "REALISTIC");
    expect(demands.idlingKwh).toBe(2 * 1 * 365);
  });
});

describe("savings types", () => {
  it("direct charging: 1000 kWh x 0.30 EUR = 300 EUR", () => {
    const outcome = directChargingSavings(
      1000,
      context({ engineType: "ELECTRIC" }),
    );
    expect(outcome.euros).toBeCloseTo(300, 9);
    expect(outcome.gridKwh).toBe(1000);
  });

  it("alternator fuel: 100 kWh x 0.4 L x 1.50 EUR = 60 EUR", () => {
    const outcome = alternatorFuelSavings(100, context());
    expect(outcome.dieselLitres).toBeCloseTo(40, 9);
    expect(outcome.euros).toBeCloseTo(60, 9);
  });

  it("alternator fuel uses the petrol price for a petrol engine", () => {
    const outcome = alternatorFuelSavings(
      100,
      context({ engineType: "PETROL" }),
    );
    expect(outcome.petrolLitres).toBeCloseTo(50, 9);
    expect(outcome.euros).toBeCloseTo(90, 9);
  });

  it("alternator fuel does not apply to an electric vehicle", () => {
    expect(
      alternatorFuelSavings(100, context({ engineType: "ELECTRIC" })).euros,
    ).toBe(0);
  });

  it("cooling unit fuel: 100 kWh through a diesel unit uses 0.39 L per kWh", () => {
    const outcome = coolingUnitFuelSavings(
      100,
      context({ cargoType: "CHILLED", coolingUnitType: "DIESEL" }),
    );
    expect(outcome.dieselLitres).toBeCloseTo(100 * 0.39, 9);
    expect(outcome.euros).toBeCloseTo(100 * 0.39 * 1.5, 9);
  });

  it("cooling unit fuel is zero without a cooling unit", () => {
    expect(coolingUnitFuelSavings(100, context()).euros).toBe(0);
  });

  it("less idling: half the cab climate energy saves half of 2190 L", () => {
    const outcome = lessIdlingSavings(365, 730, context());
    expect(outcome.dieselLitres).toBeCloseTo(1095, 9);
    expect(outcome.euros).toBeCloseTo(1095 * 1.5, 9);
  });

  it("less idling is zero when the vehicle does not idle", () => {
    expect(lessIdlingSavings(0, 0, context({ idleHoursPerDay: 0 })).euros).toBe(
      0,
    );
  });

  it("battery breakdowns: (0.10 - 0.05) x 200 EUR = 10 EUR a year", () => {
    expect(batteryBreakdownSavingsPerYear(context())).toBeCloseTo(10, 9);
  });

  it("battery replacement: saved in year 4, paid in year 6, saved in year 8", () => {
    expect(batteryReplacementSavingsInYear(3, context())).toBe(0);
    expect(batteryReplacementSavingsInYear(4, context())).toBe(100);
    expect(batteryReplacementSavingsInYear(6, context())).toBe(-100);
    expect(batteryReplacementSavingsInYear(8, context())).toBe(100);
  });
});

describe("finance", () => {
  it("costs capacity x cost per kWp x quantity in cents", () => {
    expect(
      oneTimeCostBeforeSubsidyCents(
        SIMPLE_SET,
        { ...RESOLVED, solarPanelCapacityKw: 1.5, quantity: 2 },
        "REALISTIC",
      ),
    ).toBe(600000);
  });

  it("maintenance is capacity x yearly cost x quantity in cents", () => {
    expect(
      annualMaintenanceCents(
        SIMPLE_SET,
        { ...RESOLVED, quantity: 3 },
        "REALISTIC",
      ),
    ).toBe(6000);
  });

  it("uses the subsidy override and never exceeds the cost", () => {
    expect(
      subsidyCents(
        SIMPLE_SET,
        { ...RESOLVED, subsidyOverrideCents: 50000 },
        200000,
      ),
    ).toBe(50000);
    expect(
      subsidyCents(
        SIMPLE_SET,
        { ...RESOLVED, subsidyOverrideCents: 900000 },
        200000,
      ),
    ).toBe(200000);
  });

  it("has no subsidy when the country has none and there is no override", () => {
    expect(subsidyCents(SIMPLE_SET, RESOLVED, 200000)).toBe(0);
  });

  it("applies a percent subsidy with a per-vehicle cap and a fixed subsidy per vehicle", () => {
    const setWithSubsidies: AssumptionSet = {
      ...SIMPLE_SET,
      countries: {
        ...SIMPLE_SET.countries,
        DE: {
          ...SIMPLE_SET.countries.DE,
          subsidies: [
            {
              name: "percent",
              type: "percent",
              amount: 20,
              cap: 300,
              sourceUrl: "",
            },
            { name: "fixed", type: "fixed", amount: 100, sourceUrl: "" },
          ],
        },
      },
    };
    expect(
      subsidyCents(setWithSubsidies, { ...RESOLVED, quantity: 2 }, 200000),
    ).toBe(40000 + 20000);
  });

  it("pays back in 24 months when the cost is 1200 and the yearly net is 600", () => {
    expect(paybackMonths(120000, Array(25).fill(60000))).toBe(24);
  });

  it("returns null when the cost is not recovered within 25 years", () => {
    expect(paybackMonths(120000, Array(25).fill(1000))).toBeNull();
  });

  it("returns 0 months when nothing has to be paid back", () => {
    expect(paybackMonths(0, Array(25).fill(1000))).toBe(0);
  });

  it("builds a cumulative series of 11 points starting at minus the cost", () => {
    const series = cumulativeSeries(1000, Array(25).fill(400));
    expect(series).toHaveLength(11);
    expect(series[0]).toBe(-1000);
    expect(series[10]).toBe(3000);
  });
});

describe("input resolution", () => {
  it("fills missing optional inputs from the presets and records their source", () => {
    const resolved = resolveInput(BASE_INPUT, REAL_ASSUMPTIONS, "REALISTIC");
    const sources = resolveInputSources(BASE_INPUT);

    expect(resolved.solarPanelCapacityKw).toBe(
      REAL_ASSUMPTIONS.vehicleTypes.VAN.usablePanelCapacityKw.ROOF.value
        .realistic,
    );
    expect(sources.solarPanelCapacityKw).toBe("PRESET");
    expect(sources.vehicleType).toBe("PROVIDED");
  });

  it("keeps provided optional inputs and marks them as provided", () => {
    const input = { ...BASE_INPUT, solarPanelCapacityKw: 2 };
    expect(
      resolveInput(input, REAL_ASSUMPTIONS, "PESSIMISTIC").solarPanelCapacityKw,
    ).toBe(2);
    expect(resolveInputSources(input).solarPanelCapacityKw).toBe("PROVIDED");
  });

  it("picks a typical cooling unit only for chilled cargo", () => {
    const chilled = resolveInput(
      { ...BASE_INPUT, cargoType: "CHILLED" },
      REAL_ASSUMPTIONS,
      "REALISTIC",
    );
    expect(chilled.coolingUnitType).toBe("ENGINE_DRIVEN");
    expect(
      resolveInput(BASE_INPUT, REAL_ASSUMPTIONS, "REALISTIC").coolingUnitType,
    ).toBeUndefined();
  });
});

describe("calculate", () => {
  it("returns three scenarios with the formula and assumption versions", () => {
    const output = calculate(BASE_INPUT, REAL_ASSUMPTIONS);

    expect(output.formulaVersion).toBe(FORMULA_VERSION);
    expect(output.assumptionSetVersion).toBe("2026.1");
    expect(Object.keys(output.scenarios)).toEqual([
      "PESSIMISTIC",
      "REALISTIC",
      "OPTIMISTIC",
    ]);
  });

  it("returns an 11 point series for every scenario", () => {
    const output = calculate(BASE_INPUT, REAL_ASSUMPTIONS);
    for (const scenario of Object.values(output.scenarios)) {
      expect(scenario.cumulativeSavingsSeriesCents).toHaveLength(11);
      expect(scenario.cumulativeSavingsSeriesCents[0]).toBe(
        -scenario.oneTimeCostAfterSubsidyCents,
      );
    }
  });

  it("multiplies energy and money by the quantity", () => {
    const one = calculate(BASE_INPUT, REAL_ASSUMPTIONS).scenarios.REALISTIC;
    const ten = calculate({ ...BASE_INPUT, quantity: 10 }, REAL_ASSUMPTIONS)
      .scenarios.REALISTIC;

    expect(ten.yearlySolarEnergyKwh).toBeCloseTo(
      one.yearlySolarEnergyKwh * 10,
      6,
    );
    expect(ten.oneTimeCostBeforeSubsidyCents).toBe(
      one.oneTimeCostBeforeSubsidyCents * 10,
    );
  });

  it("rejects out-of-range inputs", () => {
    expect(() =>
      calculate({ ...BASE_INPUT, quantity: 1.5 }, REAL_ASSUMPTIONS),
    ).toThrow("quantity");
    expect(() =>
      calculate(
        { ...BASE_INPUT, operatingMonthsPerYear: 13 },
        REAL_ASSUMPTIONS,
      ),
    ).toThrow("operatingMonthsPerYear");
    expect(() =>
      calculate({ ...BASE_INPUT, latitude: 200 }, REAL_ASSUMPTIONS),
    ).toThrow("latitude");
    expect(() =>
      calculate({ ...BASE_INPUT, idleHoursPerDay: 25 }, REAL_ASSUMPTIONS),
    ).toThrow("idleHoursPerDay");
    expect(() =>
      calculate(
        { ...BASE_INPUT, averageDailyDistanceKm: -1 },
        REAL_ASSUMPTIONS,
      ),
    ).toThrow("averageDailyDistanceKm");
  });

  it("does not report a cooling unit source when the cargo is not chilled", () => {
    const sources = resolveInputSources({
      ...BASE_INPUT,
      coolingUnitType: "DIESEL",
    });
    expect(sources.coolingUnitType).toBeUndefined();
  });

  it("rejects an invalid quantity and an unknown country", () => {
    expect(() =>
      calculate({ ...BASE_INPUT, quantity: 0 }, REAL_ASSUMPTIONS),
    ).toThrow("quantity");
    expect(() =>
      calculate(
        { ...BASE_INPUT, countryCode: "US" as never },
        REAL_ASSUMPTIONS,
      ),
    ).toThrow("Unsupported country");
  });
});
