export interface ScenarioRange<T> {
  pessimistic: T;
  realistic: T;
  optimistic: T;
}

export type FavourableDirection = "higher" | "lower";

export interface Assumption {
  value: ScenarioRange<number>;
  unit: string;
  sourceUrl: string;
  sourceTitle: string;
  accessedOn: string;
  favourableDirection: FavourableDirection;
  note?: string;
}

export interface Subsidy {
  name: string;
  type: "percent" | "fixed";
  amount: number;
  cap?: number;
  sourceUrl: string;
}

export const ASSUMPTION_SOURCE_TITLE = "ASSUMPTION";

export const DISTANCE_BANDS = ["SHORT", "REGIONAL", "LONG"] as const;
export type DistanceBand = (typeof DISTANCE_BANDS)[number];

export const IDLING_FREQUENCIES = ["RARELY", "SOMETIMES", "OFTEN"] as const;
export type IdlingFrequency = (typeof IDLING_FREQUENCIES)[number];

export const COOLING_UNIT_TYPES = [
  "DIESEL",
  "ENGINE_DRIVEN",
  "ELECTRIC",
] as const;
export type CoolingUnitType = (typeof COOLING_UNIT_TYPES)[number];

export const SEASONS = ["summer", "winter"] as const;
export type Season = (typeof SEASONS)[number];
