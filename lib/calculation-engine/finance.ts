import type { AssumptionSet } from "@/lib/assumptions/v1";
import {
  CENTS_PER_EURO,
  MONTHS_PER_YEAR,
  PAYBACK_HORIZON_YEARS,
  SERIES_YEARS,
} from "@/lib/calculation-engine/constants";
import { scenarioValue } from "@/lib/calculation-engine/scenario-values";
import type {
  ResolvedInput,
  ScenarioKind,
} from "@/lib/calculation-engine/types";

export function toCents(euros: number): number {
  return Math.round(euros * CENTS_PER_EURO);
}

export function oneTimeCostBeforeSubsidyCents(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  scenario: ScenarioKind,
): number {
  const costPerKwp = scenarioValue(
    assumptionSet.costs.installedSystemCostPerKwp,
    scenario,
  );

  return toCents(input.solarPanelCapacityKw * costPerKwp * input.quantity);
}

export function annualMaintenanceCents(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  scenario: ScenarioKind,
): number {
  const maintenancePerKwp = scenarioValue(
    assumptionSet.costs.annualMaintenancePerKwp,
    scenario,
  );

  return toCents(
    input.solarPanelCapacityKw * maintenancePerKwp * input.quantity,
  );
}

export function subsidyCents(
  assumptionSet: AssumptionSet,
  input: ResolvedInput,
  costBeforeSubsidyCents: number,
): number {
  if (input.subsidyOverrideCents !== undefined) {
    return clamp(input.subsidyOverrideCents, 0, costBeforeSubsidyCents);
  }

  const { subsidies } = assumptionSet.countries[input.countryCode];
  const total = subsidies.reduce((sum, subsidy) => {
    if (subsidy.type === "fixed") {
      return sum + toCents(subsidy.amount * input.quantity);
    }
    const percentShare = Math.round(
      (costBeforeSubsidyCents * subsidy.amount) / 100,
    );
    return (
      sum +
      Math.min(
        percentShare,
        toCents((subsidy.cap ?? Infinity) * input.quantity),
      )
    );
  }, 0);

  return clamp(total, 0, costBeforeSubsidyCents);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function cumulativeSeries(
  costAfterSubsidyCents: number,
  yearlyNetCents: readonly number[],
): number[] {
  const series = [-costAfterSubsidyCents];

  for (let year = 1; year <= SERIES_YEARS; year += 1) {
    series.push(series[year - 1] + yearlyNetCents[year - 1]);
  }

  return series;
}

export function paybackMonths(
  costAfterSubsidyCents: number,
  yearlyNetCents: readonly number[],
): number | null {
  let cumulative = -costAfterSubsidyCents;

  if (cumulative >= 0) return 0;

  for (let year = 1; year <= PAYBACK_HORIZON_YEARS; year += 1) {
    const yearNet = yearlyNetCents[year - 1];
    const next = cumulative + yearNet;

    if (next >= 0) {
      const shareOfYearNeeded = -cumulative / yearNet;
      return (year - 1 + shareOfYearNeeded) * MONTHS_PER_YEAR;
    }

    cumulative = next;
  }

  return null;
}
