import { useFormatter, useTranslations } from "next-intl";
import type { AnswerRow } from "@/components/calculator/AnswersList";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import type { CalculatorFormValues } from "@/lib/calculator-form";

interface CalculatorAnswersSummary {
  answers: AnswerRow[];
  summary: string;
}

export function useCalculatorAnswers(
  values: CalculatorFormValues,
): CalculatorAnswersSummary {
  const t = useTranslations("calculator");
  const format = useFormatter();
  const vehiclesSummary = t("answers.vehiclesValue", {
    quantity: values.quantity,
    vehicleType: t(`options.vehicleType.${values.vehicleType}`),
  });
  const dailyKilometres =
    values.averageDailyDistanceKm ??
    ASSUMPTION_SET_V1.distanceBands[values.distanceBand].value.realistic;

  return {
    summary: vehiclesSummary,
    answers: [
      { label: t("answers.vehicles"), value: vehiclesSummary },
      {
        label: t("answers.cargo"),
        value: t(`options.cargoType.${values.cargoType}`),
      },
      {
        label: t("answers.dailyDistance"),
        value: t("answers.dailyDistanceValue", {
          kilometres: format.number(dailyKilometres, {
            maximumFractionDigits: 0,
          }),
        }),
      },
      {
        label: t("answers.idling"),
        value: t(`options.idlingFrequency.${values.idlingFrequency}`),
      },
      { label: t("answers.location"), value: values.city?.label ?? null },
      {
        label: t("answers.panels"),
        value: t(`options.solarPanelPlacement.${values.solarPanelPlacement}`),
      },
    ],
  };
}
