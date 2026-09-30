import { calculate, type CalculationInput } from "@/lib/calculation-engine";
import {
  BASE_INPUT,
  BERLIN,
  distanceForBand,
  MADRID,
  PARIS,
  REAL_ASSUMPTIONS,
  SEVILLE,
  WARSAW,
} from "@/lib/calculation-engine/test-fixtures";

const OFTEN_IDLE_HOURS =
  REAL_ASSUMPTIONS.idling.hoursPerDay.OFTEN.value.realistic;
const CUSTOM_SUBSIDY_CENTS = 600000;

const GOLDEN_CASES: Record<string, CalculationInput> = {
  "1 diesel van, regional, Berlin, roof, regular goods": {
    ...BASE_INPUT,
    averageDailyDistanceKm: distanceForBand("REGIONAL"),
    ...BERLIN,
  },
  "1 electric van, short, Paris, roof": {
    ...BASE_INPUT,
    engineType: "ELECTRIC",
    averageDailyDistanceKm: distanceForBand("SHORT"),
    ...PARIS,
  },
  "1 refrigerated trailer with a diesel cooling unit, regional, Madrid, roof": {
    ...BASE_INPUT,
    vehicleType: "TRAILER",
    cargoType: "CHILLED",
    coolingUnitType: "DIESEL",
    averageDailyDistanceKm: distanceForBand("REGIONAL"),
    ...MADRID,
  },
  "1 long-haul truck, long, idles often, Warsaw, roof": {
    ...BASE_INPUT,
    vehicleType: "TRUCK",
    averageDailyDistanceKm: distanceForBand("LONG"),
    idleHoursPerDay: OFTEN_IDLE_HOURS,
    ...WARSAW,
  },
  "10 vans, regional, Seville, roof, custom subsidy": {
    ...BASE_INPUT,
    quantity: 10,
    averageDailyDistanceKm: distanceForBand("REGIONAL"),
    subsidyOverrideCents: CUSTOM_SUBSIDY_CENTS,
    ...SEVILLE,
  },
};

describe("golden calculation cases", () => {
  it("covers exactly five cases", () => {
    expect(Object.keys(GOLDEN_CASES)).toHaveLength(5);
  });

  it.each(Object.entries(GOLDEN_CASES))("%s", (_name, input) => {
    expect(calculate(input, REAL_ASSUMPTIONS)).toMatchSnapshot();
  });
});
