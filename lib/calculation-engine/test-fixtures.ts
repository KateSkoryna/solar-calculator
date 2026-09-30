import type { EuCountryCode } from "@/lib/assumptions/eu-countries";
import type { Assumption } from "@/lib/assumptions/types";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import type { AssumptionSet } from "@/lib/assumptions/v1";
import type { CalculationInput } from "@/lib/calculation-engine";

export const REAL_ASSUMPTIONS = ASSUMPTION_SET_V1;

export function constantAssumption(value: number): Assumption {
  return {
    value: { pessimistic: value, realistic: value, optimistic: value },
    unit: "test",
    sourceUrl: "",
    sourceTitle: "ASSUMPTION",
    accessedOn: "2026-01-01",
    favourableDirection: "higher",
  };
}

export function scaledAssumption(assumption: Assumption, factor: number) {
  const { pessimistic, realistic, optimistic } = assumption.value;
  return {
    ...assumption,
    value: {
      pessimistic: pessimistic * factor,
      realistic: realistic * factor,
      optimistic: optimistic * factor,
    },
  };
}

export function withScaledFuelPrices(
  assumptionSet: AssumptionSet,
  countryCode: EuCountryCode,
  factor: number,
): AssumptionSet {
  const country = assumptionSet.countries[countryCode];

  return {
    ...assumptionSet,
    countries: {
      ...assumptionSet.countries,
      [countryCode]: {
        ...country,
        dieselPricePerLitre: scaledAssumption(
          country.dieselPricePerLitre,
          factor,
        ),
        petrolPricePerLitre: scaledAssumption(
          country.petrolPricePerLitre,
          factor,
        ),
      },
    },
  };
}

export const BERLIN = {
  countryCode: "DE",
  latitude: 52.52,
  longitude: 13.405,
} as const;
export const PARIS = {
  countryCode: "FR",
  latitude: 48.8566,
  longitude: 2.3522,
} as const;
export const MADRID = {
  countryCode: "ES",
  latitude: 40.4168,
  longitude: -3.7038,
} as const;
export const WARSAW = {
  countryCode: "PL",
  latitude: 52.2297,
  longitude: 21.0122,
} as const;
export const SEVILLE = {
  countryCode: "ES",
  latitude: 37.3891,
  longitude: -5.9845,
} as const;

export const BASE_INPUT = {
  vehicleType: "VAN",
  engineType: "DIESEL",
  parkingType: "MIXED",
  solarPanelPlacement: "ROOF",
  cargoType: "REGULAR",
  quantity: 1,
  averageDailyDistanceKm: 150,
  operatingMonthsPerYear: 12,
  winterUsage: true,
  ...BERLIN,
} satisfies CalculationInput;

export function distanceForBand(band: "SHORT" | "REGIONAL" | "LONG") {
  return REAL_ASSUMPTIONS.distanceBands[band].value.realistic;
}
