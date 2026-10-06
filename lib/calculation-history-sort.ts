import type { CalculationHistoryRow } from "@/lib/fleet-calculation-history";

export const CALCULATION_SORT_OPTIONS = [
  "newest",
  "oldest",
  "vehicle",
  "payback",
] as const;

export type CalculationSortOption = (typeof CALCULATION_SORT_OPTIONS)[number];

export const DEFAULT_CALCULATION_SORT: CalculationSortOption = "newest";

function paybackRank({ hasResult, paybackMonths }: CalculationHistoryRow) {
  if (!hasResult) return Number.POSITIVE_INFINITY;
  return paybackMonths ?? Number.MAX_SAFE_INTEGER;
}

const COMPARATORS: Record<
  CalculationSortOption,
  (first: CalculationHistoryRow, second: CalculationHistoryRow) => number
> = {
  newest: (first, second) =>
    second.createdAt.getTime() - first.createdAt.getTime(),
  oldest: (first, second) =>
    first.createdAt.getTime() - second.createdAt.getTime(),
  vehicle: (first, second) =>
    `${first.manufacturer} ${first.model}`.localeCompare(
      `${second.manufacturer} ${second.model}`,
    ),
  payback: (first, second) => {
    const firstRank = paybackRank(first);
    const secondRank = paybackRank(second);
    if (firstRank === secondRank) return 0;
    return firstRank < secondRank ? -1 : 1;
  },
};

export function sortCalculationHistory(
  rows: CalculationHistoryRow[],
  option: CalculationSortOption,
) {
  return [...rows].sort(COMPARATORS[option]);
}
