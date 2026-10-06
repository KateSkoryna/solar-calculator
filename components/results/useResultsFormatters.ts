import { useFormatter, useTranslations } from "next-intl";
import {
  formatDuration,
  RESULTS_CURRENCY,
  type DurationParts,
  type ValueRange,
} from "@/lib/results-view-model";

const MONEY_SIGNIFICANT_DIGITS = 3;
const TONNES_FRACTION_DIGITS = 1;

export function useResultsFormatters() {
  const t = useTranslations("results");
  const format = useFormatter();

  const money = (euros: number) =>
    format.number(euros, {
      style: "currency",
      currency: RESULTS_CURRENCY,
      maximumSignificantDigits: MONEY_SIGNIFICANT_DIGITS,
    });

  const compactMoney = (euros: number) =>
    format.number(euros, {
      style: "currency",
      currency: RESULTS_CURRENCY,
      notation: "compact",
      maximumFractionDigits: 0,
    });

  const tonnes = (value: number) =>
    t("units.tonnes", {
      value: format.number(value, {
        maximumFractionDigits: TONNES_FRACTION_DIGITS,
      }),
    });

  const duration = (parts: DurationParts) =>
    formatDuration(parts, (key, values) => t(`duration.${key}`, values));

  const rangeOf = (range: ValueRange, formatValue: (value: number) => string) =>
    t("tiles.range", {
      low: formatValue(range.low),
      high: formatValue(range.high),
    });

  return { money, compactMoney, tonnes, duration, rangeOf };
}
