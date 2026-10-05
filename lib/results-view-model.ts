import type { DistanceBand } from "@/lib/assumptions/types";
import {
  CENTS_PER_EURO,
  MONTHS_PER_YEAR,
  SERIES_YEARS,
} from "@/lib/calculation-engine/constants";
import {
  SAVINGS_TYPES,
  SCENARIO_KINDS,
  type CalculationInput,
  type CalculationOutput,
  type InputSource,
  type PanelPlacement,
  type SavingsType,
  type ScenarioKind,
  type ScenarioResult,
  type VehicleKind,
} from "@/lib/calculation-engine/types";

export const RESULTS_CURRENCY = "EUR";

export const VERDICT_VARIANTS = ["PAYS_OFF", "SLOWLY", "UNLIKELY"] as const;
export type VerdictVariant = (typeof VERDICT_VARIANTS)[number];

export const DURATION_FORMS = ["long", "short"] as const;
export type DurationForm = (typeof DURATION_FORMS)[number];

export const INPUT_VALUE_KINDS = {
  manufacturer: "text",
  model: "text",
  city: "text",
  vehicleType: "option",
  engineType: "option",
  parkingType: "option",
  solarPanelPlacement: "option",
  cargoType: "option",
  coolingUnitType: "option",
  quantity: "number",
  averageDailyDistanceKm: "number",
  operatingMonthsPerYear: "number",
  latitude: "number",
  longitude: "number",
  energyConsumptionKwhPer100km: "number",
  solarPanelCapacityKw: "number",
  payloadReserveKg: "number",
  maxRoofLoadKg: "number",
  idleHoursPerDay: "number",
  winterUsage: "boolean",
  countryCode: "country",
  subsidyOverrideCents: "money",
} as const satisfies Record<keyof CalculationInput, string>;

export type InputKey = keyof CalculationInput;
export type InputValueKind = (typeof INPUT_VALUE_KINDS)[InputKey];

const PAYS_OFF_MAX_MONTHS = SERIES_YEARS * MONTHS_PER_YEAR;
const MINIMUM_DURATION_MONTHS = 1;
const FIRST_YEAR = 1;
const KILOGRAMS_PER_TONNE = 1000;
const FULL_PERCENT = 100;
const NO_SHARE_PERCENT = 0;
const ALWAYS_SHOWN_SAVINGS_TYPE: SavingsType = "FEWER_BATTERY_BREAKDOWNS";

export interface DurationParts {
  years: number;
  months: number;
}

export interface PaybackRange {
  shortest: DurationParts;
  longest: DurationParts | null;
}

export interface ValueRange {
  realistic: number;
  low: number;
  high: number;
}

export type ChartPoint = { year: number } & Record<ScenarioKind, number>;

export interface BreakEvenPoint {
  kind: ScenarioKind;
  year: number;
  savingsEuros: number;
}

export interface BreakEvenYearRange {
  earliest: number;
  latest: number;
}

export interface SavingsLine {
  type: SavingsType;
  annualEuros: number;
  sharePercent: number;
}

export interface InputRow {
  key: InputKey;
  kind: InputValueKind;
  source: InputSource;
  value: string | number | boolean;
}

export interface ResultsContext {
  distanceBand?: DistanceBand;
}

export interface ResultsViewModel {
  currency: string;
  summary: {
    quantity: number;
    vehicleType: VehicleKind;
    distanceBand: DistanceBand | null;
    averageDailyDistanceKm: number;
    city: string | null;
    solarPanelPlacement: PanelPlacement;
  };
  verdict: {
    variant: VerdictVariant;
    duration: DurationParts | null;
    range: PaybackRange | null;
    annualSavingsEuros: number;
  };
  tiles: {
    annualSavingsEuros: ValueRange;
    oneTimeCostEuros: ValueRange;
    co2AvoidedTonnes: ValueRange;
    tenYearGainEuros: ValueRange;
  };
  chart: {
    points: ChartPoint[];
    costEuros: number;
    breakEvenPoints: BreakEvenPoint[];
    breakEvenYear: number | null;
    breakEvenYearRange: BreakEvenYearRange | null;
  };
  savingsBreakdown: SavingsLine[];
  inputs: InputRow[];
  formulaVersion: string;
  assumptionSetVersion: string;
}

type Scenarios = CalculationOutput["scenarios"];
type DurationTranslator = (
  key: string,
  values: Record<string, number>,
) => string;

function centsToEuros(cents: number) {
  return cents / CENTS_PER_EURO;
}

export function humaniseDuration(totalMonths: number): DurationParts {
  const wholeMonths = Math.max(
    MINIMUM_DURATION_MONTHS,
    Math.round(totalMonths),
  );
  return {
    years: Math.floor(wholeMonths / MONTHS_PER_YEAR),
    months: wholeMonths % MONTHS_PER_YEAR,
  };
}

function durationMessageKey({ years, months }: DurationParts) {
  if (years === 0) return "monthsOnly";
  if (months === 0) return "yearsOnly";
  return "yearsAndMonths";
}

export function formatDuration(
  duration: DurationParts,
  form: DurationForm,
  translate: DurationTranslator,
) {
  return translate(`${form}.${durationMessageKey(duration)}`, {
    years: duration.years,
    months: duration.months,
  });
}

function paysOffWithinSeries(paybackMonths: number | null) {
  return (
    paybackMonths !== null && Math.round(paybackMonths) <= PAYS_OFF_MAX_MONTHS
  );
}

export function verdictVariantFor(
  paybackMonths: number | null,
): VerdictVariant {
  if (paybackMonths === null) return "UNLIKELY";
  return paysOffWithinSeries(paybackMonths) ? "PAYS_OFF" : "SLOWLY";
}

function isSameDuration(first: DurationParts, second: DurationParts) {
  return first.years === second.years && first.months === second.months;
}

function paybackRange(scenarios: Scenarios): PaybackRange | null {
  const optimisticMonths = scenarios.OPTIMISTIC.paybackMonths;
  const pessimisticMonths = scenarios.PESSIMISTIC.paybackMonths;
  if (optimisticMonths === null) return null;

  const shortest = humaniseDuration(optimisticMonths);
  const longest =
    pessimisticMonths === null ? null : humaniseDuration(pessimisticMonths);
  if (longest !== null && isSameDuration(shortest, longest)) return null;

  return { shortest, longest };
}

function valueRange(
  scenarios: Scenarios,
  pickValue: (scenario: ScenarioResult) => number,
): ValueRange {
  const scenarioValues = SCENARIO_KINDS.map((kind) =>
    pickValue(scenarios[kind]),
  );
  return {
    realistic: pickValue(scenarios.REALISTIC),
    low: Math.min(...scenarioValues),
    high: Math.max(...scenarioValues),
  };
}

function cumulativeSavingsEuros(scenario: ScenarioResult, year: number) {
  return centsToEuros(
    scenario.cumulativeSavingsSeriesCents[year] +
      scenario.oneTimeCostAfterSubsidyCents,
  );
}

function chartPoints(scenarios: Scenarios): ChartPoint[] {
  return Array.from({ length: SERIES_YEARS + 1 }, (_, year) => ({
    year,
    PESSIMISTIC: cumulativeSavingsEuros(scenarios.PESSIMISTIC, year),
    REALISTIC: cumulativeSavingsEuros(scenarios.REALISTIC, year),
    OPTIMISTIC: cumulativeSavingsEuros(scenarios.OPTIMISTIC, year),
  }));
}

function breakEvenPoints(scenarios: Scenarios): BreakEvenPoint[] {
  return SCENARIO_KINDS.flatMap((kind) => {
    const { paybackMonths, oneTimeCostAfterSubsidyCents } = scenarios[kind];
    if (paybackMonths === null || !paysOffWithinSeries(paybackMonths)) {
      return [];
    }
    return [
      {
        kind,
        year: Math.min(paybackMonths / MONTHS_PER_YEAR, SERIES_YEARS),
        savingsEuros: centsToEuros(oneTimeCostAfterSubsidyCents),
      },
    ];
  });
}

function breakEvenYear(paybackMonths: number | null) {
  if (paybackMonths === null || !paysOffWithinSeries(paybackMonths)) {
    return null;
  }
  return Math.min(
    Math.max(FIRST_YEAR, Math.ceil(paybackMonths / MONTHS_PER_YEAR)),
    SERIES_YEARS,
  );
}

function breakEvenYearRange(scenarios: Scenarios): BreakEvenYearRange | null {
  const earliest = breakEvenYear(scenarios.OPTIMISTIC.paybackMonths);
  const latest = breakEvenYear(scenarios.PESSIMISTIC.paybackMonths);
  if (earliest === null || latest === null || earliest === latest) return null;
  return { earliest, latest };
}

function savingsBreakdown(realistic: ScenarioResult): SavingsLine[] {
  return SAVINGS_TYPES.filter(
    (type) =>
      type === ALWAYS_SHOWN_SAVINGS_TYPE ||
      realistic.savingsByTypeCents[type] > 0,
  ).map((type) => ({
    type,
    annualEuros: centsToEuros(realistic.savingsByTypeCents[type]),
    sharePercent:
      realistic.annualSavingsCents > 0
        ? (realistic.savingsByTypeCents[type] / realistic.annualSavingsCents) *
          FULL_PERCENT
        : NO_SHARE_PERCENT,
  }));
}

function inputRows(output: CalculationOutput): InputRow[] {
  const { resolvedInput } = output.scenarios.REALISTIC;

  return (Object.keys(output.inputSources) as InputKey[]).flatMap((key) => {
    const source = output.inputSources[key];
    const value = resolvedInput[key];
    if (source === undefined || value === undefined) return [];
    return [{ key, kind: INPUT_VALUE_KINDS[key], source, value }];
  });
}

const TYPICAL_VALUE_SOURCE: InputSource = "PRESET";

export function typicalValueInputKeys(inputs: InputRow[]): InputKey[] {
  return inputs
    .filter((input) => input.source === TYPICAL_VALUE_SOURCE)
    .map((input) => input.key);
}

export function toResultsViewModel(
  output: CalculationOutput,
  context: ResultsContext = {},
): ResultsViewModel {
  const { scenarios } = output;
  const realistic = scenarios.REALISTIC;
  const { resolvedInput } = realistic;

  return {
    currency: RESULTS_CURRENCY,
    summary: {
      quantity: resolvedInput.quantity,
      vehicleType: resolvedInput.vehicleType,
      distanceBand: context.distanceBand ?? null,
      averageDailyDistanceKm: resolvedInput.averageDailyDistanceKm,
      city: resolvedInput.city ?? null,
      solarPanelPlacement: resolvedInput.solarPanelPlacement,
    },
    verdict: {
      variant: verdictVariantFor(realistic.paybackMonths),
      duration:
        realistic.paybackMonths === null
          ? null
          : humaniseDuration(realistic.paybackMonths),
      range: paybackRange(scenarios),
      annualSavingsEuros: centsToEuros(realistic.annualSavingsCents),
    },
    tiles: {
      annualSavingsEuros: valueRange(scenarios, (scenario) =>
        centsToEuros(scenario.annualSavingsCents),
      ),
      oneTimeCostEuros: valueRange(scenarios, (scenario) =>
        centsToEuros(scenario.oneTimeCostAfterSubsidyCents),
      ),
      co2AvoidedTonnes: valueRange(
        scenarios,
        (scenario) => scenario.co2AvoidedKgPerYear / KILOGRAMS_PER_TONNE,
      ),
      tenYearGainEuros: valueRange(scenarios, (scenario) =>
        centsToEuros(scenario.tenYearNetGainCents),
      ),
    },
    chart: {
      points: chartPoints(scenarios),
      costEuros: centsToEuros(realistic.oneTimeCostAfterSubsidyCents),
      breakEvenPoints: breakEvenPoints(scenarios),
      breakEvenYear: breakEvenYear(realistic.paybackMonths),
      breakEvenYearRange: breakEvenYearRange(scenarios),
    },
    savingsBreakdown: savingsBreakdown(realistic),
    inputs: inputRows(output),
    formulaVersion: output.formulaVersion,
    assumptionSetVersion: output.assumptionSetVersion,
  };
}
