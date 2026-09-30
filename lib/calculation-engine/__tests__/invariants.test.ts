import type { EuCountryCode } from "@/lib/assumptions/eu-countries";
import { calculate } from "@/lib/calculation-engine";
import {
  ENGINE_TYPES,
  SAVINGS_TYPES,
  VEHICLE_TYPES,
  type CalculationInput,
  type ScenarioResult,
} from "@/lib/calculation-engine";
import {
  BERLIN,
  MADRID,
  REAL_ASSUMPTIONS,
  WARSAW,
  withScaledFuelPrices,
} from "@/lib/calculation-engine/test-fixtures";

const LOCATIONS = [BERLIN, MADRID, WARSAW] as const;
const PLACEMENTS = ["ROOF", "ALL_OVER"] as const;
const FUEL_SAVINGS_TYPES = [
  "COOLING_UNIT_FUEL",
  "LESS_IDLING",
  "ALTERNATOR_FUEL",
] as const;
const FUEL_PRICE_FACTOR = 1.5;
const ENERGY_TOLERANCE = 1e-6;

function buildInputGrid(): CalculationInput[] {
  const inputs: CalculationInput[] = [];

  for (const vehicleType of VEHICLE_TYPES) {
    for (const engineType of ENGINE_TYPES) {
      for (const location of LOCATIONS) {
        for (const solarPanelPlacement of PLACEMENTS) {
          const isChilled = inputs.length % 3 === 0;
          inputs.push({
            vehicleType,
            engineType,
            parkingType: "MIXED",
            solarPanelPlacement,
            cargoType: isChilled ? "CHILLED" : "REGULAR",
            quantity: 1 + (inputs.length % 4),
            averageDailyDistanceKm: 60 + (inputs.length % 5) * 90,
            operatingMonthsPerYear: 6 + (inputs.length % 7),
            winterUsage: inputs.length % 2 === 0,
            idleHoursPerDay: (inputs.length % 4) * 0.75,
            ...location,
          });
        }
      }
    }
  }

  return inputs;
}

const INPUT_GRID = buildInputGrid();

function paybackOrInfinity(result: ScenarioResult) {
  return result.paybackMonths ?? Number.POSITIVE_INFINITY;
}

function energyValues(result: ScenarioResult) {
  const { energy } = result;
  return [
    energy.producedKwh,
    energy.coolingKwh,
    energy.idlingKwh,
    energy.auxiliaryKwh,
    energy.directChargingKwh,
    energy.wastedKwh,
  ];
}

describe("calculation invariants", () => {
  it("runs on at least 50 generated inputs", () => {
    expect(INPUT_GRID.length).toBeGreaterThanOrEqual(50);
  });

  it.each(INPUT_GRID.map((input, index) => [index, input] as const))(
    "case %i is deterministic",
    (_index, input) => {
      expect(JSON.stringify(calculate(input, REAL_ASSUMPTIONS))).toBe(
        JSON.stringify(calculate(input, REAL_ASSUMPTIONS)),
      );
    },
  );

  it.each(INPUT_GRID.map((input, index) => [index, input] as const))(
    "case %i has no NaN and no negative energy",
    (_index, input) => {
      for (const result of Object.values(
        calculate(input, REAL_ASSUMPTIONS).scenarios,
      )) {
        for (const value of energyValues(result)) {
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
        }
        expect(Number.isFinite(result.co2AvoidedKgPerYear)).toBe(true);
        expect(Number.isFinite(result.annualSavingsCents)).toBe(true);
        for (const point of result.cumulativeSavingsSeriesCents) {
          expect(Number.isFinite(point)).toBe(true);
        }
      }
    },
  );

  it.each(INPUT_GRID.map((input, index) => [index, input] as const))(
    "case %i has pessimistic payback >= realistic >= optimistic",
    (_index, input) => {
      const { PESSIMISTIC, REALISTIC, OPTIMISTIC } = calculate(
        input,
        REAL_ASSUMPTIONS,
      ).scenarios;

      expect(paybackOrInfinity(PESSIMISTIC)).toBeGreaterThanOrEqual(
        paybackOrInfinity(REALISTIC),
      );
      expect(paybackOrInfinity(REALISTIC)).toBeGreaterThanOrEqual(
        paybackOrInfinity(OPTIMISTIC),
      );
    },
  );

  it.each(INPUT_GRID.map((input, index) => [index, input] as const))(
    "case %i never gives less energy with more kWp",
    (_index, input) => {
      const small = calculate(
        { ...input, solarPanelCapacityKw: 1 },
        REAL_ASSUMPTIONS,
      );
      const large = calculate(
        { ...input, solarPanelCapacityKw: 2 },
        REAL_ASSUMPTIONS,
      );

      for (const kind of ["PESSIMISTIC", "REALISTIC", "OPTIMISTIC"] as const) {
        expect(
          large.scenarios[kind].yearlySolarEnergyKwh,
        ).toBeGreaterThanOrEqual(small.scenarios[kind].yearlySolarEnergyKwh);
      }
    },
  );

  it.each(INPUT_GRID.map((input, index) => [index, input] as const))(
    "case %i never gives lower fuel savings at a higher fuel price",
    (_index, input) => {
      const cheap = calculate(input, REAL_ASSUMPTIONS);
      const expensive = calculate(
        input,
        withScaledFuelPrices(
          REAL_ASSUMPTIONS,
          input.countryCode as EuCountryCode,
          FUEL_PRICE_FACTOR,
        ),
      );

      for (const kind of ["PESSIMISTIC", "REALISTIC", "OPTIMISTIC"] as const) {
        for (const type of FUEL_SAVINGS_TYPES) {
          expect(
            expensive.scenarios[kind].savingsByTypeCents[type],
          ).toBeGreaterThanOrEqual(
            cheap.scenarios[kind].savingsByTypeCents[type],
          );
        }
      }
    },
  );

  it.each(INPUT_GRID.map((input, index) => [index, input] as const))(
    "case %i never allocates more energy than it produces",
    (_index, input) => {
      for (const result of Object.values(
        calculate(input, REAL_ASSUMPTIONS).scenarios,
      )) {
        const { energy } = result;
        const allocated =
          energy.coolingKwh +
          energy.idlingKwh +
          energy.auxiliaryKwh +
          energy.directChargingKwh;

        expect(allocated).toBeLessThanOrEqual(
          energy.producedKwh + ENERGY_TOLERANCE,
        );
        expect(allocated + energy.wastedKwh).toBeCloseTo(energy.producedKwh, 6);
      }
    },
  );

  it("sums the per-type savings to the annual total", () => {
    for (const input of INPUT_GRID) {
      for (const result of Object.values(
        calculate(input, REAL_ASSUMPTIONS).scenarios,
      )) {
        const sum = SAVINGS_TYPES.reduce(
          (total, type) => total + result.savingsByTypeCents[type],
          0,
        );
        expect(sum).toBe(result.annualSavingsCents);
      }
    }
  });
});
