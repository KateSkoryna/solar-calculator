import { CENTS_PER_EURO } from "@/lib/calculation-engine/constants";
import {
  RESULTS_CURRENCY,
  type InputKey,
  type InputRow,
} from "@/lib/results-view-model";

export type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface NumberFormatChoices {
  style?: "currency";
  currency?: string;
  maximumFractionDigits?: number;
}

export interface InputValueFormatContext {
  translate: Translate;
  locale: string;
  formatNumber: (value: number, options?: NumberFormatChoices) => string;
}

const NUMBER_FRACTION_DIGITS = 2;
const HOW_WE_CALCULATED_NAMESPACE = "results.howWeCalculated";
const CALCULATOR_OPTIONS_NAMESPACE = "calculator.options";
const OPTION_NAMESPACES: Partial<Record<InputKey, string>> = {
  vehicleType: `${CALCULATOR_OPTIONS_NAMESPACE}.vehicleType`,
  parkingType: `${CALCULATOR_OPTIONS_NAMESPACE}.parkingType`,
  solarPanelPlacement: `${CALCULATOR_OPTIONS_NAMESPACE}.solarPanelPlacement`,
  cargoType: `${CALCULATOR_OPTIONS_NAMESPACE}.cargoType`,
  coolingUnitType: `${CALCULATOR_OPTIONS_NAMESPACE}.coolingUnitType`,
  engineType: `${HOW_WE_CALCULATED_NAMESPACE}.engineType`,
};

export function formatInputValue(
  { key, kind, value }: Pick<InputRow, "key" | "kind" | "value">,
  { translate, locale, formatNumber }: InputValueFormatContext,
) {
  if (kind === "option") {
    return translate(`${OPTION_NAMESPACES[key]}.${value}`);
  }
  if (kind === "boolean") {
    return translate(`${HOW_WE_CALCULATED_NAMESPACE}.${value ? "yes" : "no"}`);
  }
  if (kind === "country") {
    return (
      new Intl.DisplayNames([locale], { type: "region" }).of(String(value)) ??
      String(value)
    );
  }
  if (kind === "money") {
    return formatNumber(Number(value) / CENTS_PER_EURO, {
      style: "currency",
      currency: RESULTS_CURRENCY,
      maximumFractionDigits: 0,
    });
  }
  if (kind === "number") {
    return translate(`${HOW_WE_CALCULATED_NAMESPACE}.values.${key}`, {
      value: formatNumber(Number(value), {
        maximumFractionDigits: NUMBER_FRACTION_DIGITS,
      }),
    });
  }
  return String(value);
}
