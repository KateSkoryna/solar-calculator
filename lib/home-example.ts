import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate } from "@/lib/calculation-engine";
import {
  CENTS_PER_EURO,
  MONTHS_PER_YEAR,
} from "@/lib/calculation-engine/constants";
import { quickCheckToCalculationInput } from "@/lib/quick-check-mapping";
import type { QuickCheckAnswers } from "@/lib/quick-check-schema";

const KILOGRAMS_PER_TONNE = 1000;

export const HOME_EXAMPLE_QUICK_CHECK: QuickCheckAnswers = {
  vehicleType: "VAN",
  quantity: 10,
  cargoType: "REGULAR",
  distanceBand: "REGIONAL",
  idlingFrequency: "SOMETIMES",
  cityLabel: "Berlin",
  countryCode: "DE",
  latitude: 52.52,
  longitude: 13.405,
  parkingType: "DEPOT",
  solarPanelPlacement: "ROOF",
};

export interface HomeExampleResult {
  paybackYears: number | null;
  annualSavingsEuros: number;
  co2AvoidedTonnesPerYear: number;
  yearlySolarEnergyKwh: number;
}

export function calculateHomeExample(): HomeExampleResult {
  const realisticScenario = calculate(
    quickCheckToCalculationInput(HOME_EXAMPLE_QUICK_CHECK, ASSUMPTION_SET_V1),
    ASSUMPTION_SET_V1,
  ).scenarios.REALISTIC;

  return {
    paybackYears:
      realisticScenario.paybackMonths === null
        ? null
        : realisticScenario.paybackMonths / MONTHS_PER_YEAR,
    annualSavingsEuros: realisticScenario.annualSavingsCents / CENTS_PER_EURO,
    co2AvoidedTonnesPerYear:
      realisticScenario.co2AvoidedKgPerYear / KILOGRAMS_PER_TONNE,
    yearlySolarEnergyKwh: realisticScenario.yearlySolarEnergyKwh,
  };
}
