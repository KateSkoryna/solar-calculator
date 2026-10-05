import { useFormatter, useLocale, useTranslations } from "next-intl";
import Badge from "@/components/common/Badge";
import Disclosure from "@/components/common/Disclosure";
import Text from "@/components/common/Text";
import { formatInputValue } from "@/lib/input-value-format";
import type { ProvenanceDetails } from "@/lib/stored-calculation";
import type { InputRow } from "@/lib/results-view-model";

function useInputValueFormatter() {
  const translate = useTranslations();
  const format = useFormatter();
  const locale = useLocale();

  return (row: InputRow) =>
    formatInputValue(row, {
      translate,
      locale,
      formatNumber: format.number,
    });
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
