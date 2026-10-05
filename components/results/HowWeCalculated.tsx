import { useFormatter, useLocale, useTranslations } from "next-intl";
import Badge from "@/components/common/Badge";
import Disclosure from "@/components/common/Disclosure";
import Text from "@/components/common/Text";
import { CENTS_PER_EURO } from "@/lib/calculation-engine/constants";
import type { ProvenanceDetails } from "@/lib/stored-calculation";
import {
  RESULTS_CURRENCY,
  type InputKey,
  type InputRow,
} from "@/lib/results-view-model";

const NUMBER_FRACTION_DIGITS = 2;
const CALCULATOR_OPTIONS_NAMESPACE = "calculator.options";
const OPTION_NAMESPACES: Partial<Record<InputKey, string>> = {
  vehicleType: `${CALCULATOR_OPTIONS_NAMESPACE}.vehicleType`,
  parkingType: `${CALCULATOR_OPTIONS_NAMESPACE}.parkingType`,
  solarPanelPlacement: `${CALCULATOR_OPTIONS_NAMESPACE}.solarPanelPlacement`,
  cargoType: `${CALCULATOR_OPTIONS_NAMESPACE}.cargoType`,
  coolingUnitType: `${CALCULATOR_OPTIONS_NAMESPACE}.coolingUnitType`,
  engineType: "results.howWeCalculated.engineType",
};

function useInputValueFormatter() {
  const translate = useTranslations();
  const t = useTranslations("results.howWeCalculated");
  const format = useFormatter();
  const locale = useLocale();

  return ({ key, kind, value }: InputRow) => {
    if (kind === "option") {
      return translate(`${OPTION_NAMESPACES[key]}.${value}`);
    }
    if (kind === "boolean") return value ? t("yes") : t("no");
    if (kind === "country") {
      return (
        new Intl.DisplayNames([locale], { type: "region" }).of(String(value)) ??
        String(value)
      );
    }
    if (kind === "money") {
      return format.number(Number(value) / CENTS_PER_EURO, {
        style: "currency",
        currency: RESULTS_CURRENCY,
        maximumFractionDigits: 0,
      });
    }
    if (kind === "number") {
      return t(`values.${key}`, {
        value: format.number(Number(value), {
          maximumFractionDigits: NUMBER_FRACTION_DIGITS,
        }),
      });
    }
    return String(value);
  };
}

interface DetailRowProps {
  label: string;
  value: string;
  sourceLabel?: string;
}

function DetailRow({ label, value, sourceLabel }: DetailRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line py-3">
      <Text as="dt" size="small" tone="muted">
        {label}
      </Text>
      <dd className="flex flex-wrap items-center justify-end gap-2">
        <Text as="span" size="small" className="font-semibold">
          {value}
        </Text>
        {sourceLabel && <Badge variant="sample">{sourceLabel}</Badge>}
      </dd>
    </div>
  );
}

interface HowWeCalculatedProps {
  inputs: InputRow[];
  formulaVersion: string;
  assumptionSetVersion: string;
  provenance?: ProvenanceDetails;
}

export default function HowWeCalculated({
  inputs,
  formulaVersion,
  assumptionSetVersion,
  provenance,
}: HowWeCalculatedProps) {
  const t = useTranslations("results.howWeCalculated");
  const format = useFormatter();
  const formatInputValue = useInputValueFormatter();
  const formatMoment = (moment: Date) =>
    format.dateTime(moment, { dateStyle: "medium", timeStyle: "short" });

  return (
    <Disclosure summary={t("summary")}>
      <div className="flex flex-col gap-4 text-left">
        <Text tone="muted">{t("intro")}</Text>
        <Text className="font-semibold">{t("inputsTitle")}</Text>
        <dl>
          {inputs.map((input) => (
            <DetailRow
              key={input.key}
              label={t(`inputs.${input.key}`)}
              value={formatInputValue(input)}
              sourceLabel={t(`sources.${input.source}`)}
            />
          ))}
          <DetailRow label={t("methodVersion")} value={formulaVersion} />
          <DetailRow
            label={t("assumptionsVersion")}
            value={assumptionSetVersion}
          />
          {provenance && (
            <>
              <DetailRow
                label={t("provenance.requestedBy")}
                value={provenance.requestedBy}
              />
              <DetailRow
                label={t("provenance.calculatedOn")}
                value={formatMoment(provenance.calculatedAt)}
              />
              <DetailRow
                label={t("provenance.inputsSavedOn")}
                value={formatMoment(provenance.inputsSavedAt)}
              />
              <DetailRow
                label={t("provenance.energyPrices")}
                value={provenance.energyPriceVersion}
              />
              <DetailRow
                label={t("provenance.emissionsFactors")}
                value={provenance.emissionsFactorVersion}
              />
              <DetailRow
                label={t("provenance.solarYield")}
                value={provenance.solarYieldVersion}
              />
              <DetailRow
                label={t("provenance.currencyRates")}
                value={provenance.currencyConversionVersion}
              />
            </>
          )}
        </dl>
      </div>
    </Disclosure>
  );
}
