import type { SavingsOutcome } from "@/lib/calculation-engine/types";

export const DAYS_PER_YEAR = 365;
export const MONTHS_PER_YEAR = 12;
export const CENTS_PER_EURO = 100;
export const KILOGRAMS_PER_TONNE = 1000;
export const PAYBACK_HORIZON_YEARS = 25;
export const SERIES_YEARS = 10;
export const EARTH_RADIUS_KM = 6371;
export const DEGREES_TO_RADIANS = Math.PI / 180;

export const NO_SAVINGS: SavingsOutcome = {
  euros: 0,
  dieselLitres: 0,
  petrolLitres: 0,
  gridKwh: 0,
};
