import { useFormatter, useTranslations } from "next-intl";
import Text from "@/components/common/Text";
import type { ResultsViewModel } from "@/lib/results-view-model";

const CONTEXT_PART_SEPARATOR = " · ";

interface ResultsContextLineProps {
  summary: ResultsViewModel["summary"];
}

export function useResultsContextLine(summary: ResultsViewModel["summary"]) {
  const t = useTranslations();
  const format = useFormatter();
  const contextParts = [
    t("calculator.answers.vehiclesValue", {
      quantity: summary.quantity,
      vehicleType: t(`calculator.options.vehicleType.${summary.vehicleType}`),
    }),
    summary.distanceBand
      ? t(`calculator.options.distanceBand.${summary.distanceBand}`)
      : t("results.context.dailyDistance", {
          kilometres: format.number(summary.averageDailyDistanceKm, {
            maximumFractionDigits: 0,
          }),
        }),
    summary.city,
    t(`calculator.options.solarPanelPlacement.${summary.solarPanelPlacement}`),
  ].filter(Boolean);

  return contextParts.join(CONTEXT_PART_SEPARATOR);
}

export default function ResultsContextLine({
  summary,
}: ResultsContextLineProps) {
  const contextLine = useResultsContextLine(summary);

  return (
    <Text tone="muted" className="animate-rise">
      {contextLine}
    </Text>
  );
}
