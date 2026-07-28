import { getTranslations } from "next-intl/server";
import InfoTooltip from "@/components/common/InfoTooltip";

interface ProvenancePanelProps {
  actorLabel: string;
  calculatedAt: Date;
  formulaVersion: string;
  assumptionSetVersion: string;
  inputSnapshotCapturedAt: Date;
  energyPriceAssumptionVersion: string;
  emissionsFactorVersion: string;
  solarYieldAssumptionVersion: string;
  currencyConversionSourceVersion: string;
}

function ProvenanceRow({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="flex items-center text-sm text-[var(--text-body)]">
        {label}
        <InfoTooltip text={description} />
      </dt>
      <dd className="text-sm font-medium text-[var(--text-body)]">{value}</dd>
    </div>
  );
}

export default async function ProvenancePanel({
  actorLabel,
  calculatedAt,
  formulaVersion,
  assumptionSetVersion,
  inputSnapshotCapturedAt,
  energyPriceAssumptionVersion,
  emissionsFactorVersion,
  solarYieldAssumptionVersion,
  currencyConversionSourceVersion,
}: ProvenancePanelProps) {
  const t = await getTranslations("calculation");

  return (
    <div className="mx-auto w-full max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--accent)]">
        {t("provenanceTitle")}
      </h2>
      <dl className="divide-y divide-[var(--border)]">
        <ProvenanceRow
          label={t("requestedBy")}
          value={actorLabel}
          description={t("requestedByTooltip")}
        />
        <ProvenanceRow
          label={t("calculatedOn")}
          value={calculatedAt.toLocaleString()}
          description={t("calculatedOnTooltip")}
        />
        <ProvenanceRow
          label={t("formulaVersion")}
          value={formulaVersion}
          description={t("formulaVersionTooltip")}
        />
        <ProvenanceRow
          label={t("assumptionSet")}
          value={assumptionSetVersion}
          description={t("assumptionSetTooltip")}
        />
        <ProvenanceRow
          label={t("inputSnapshotCaptured")}
          value={inputSnapshotCapturedAt.toLocaleString()}
          description={t("inputSnapshotCapturedTooltip")}
        />
        <ProvenanceRow
          label={t("energyPriceAssumptions")}
          value={energyPriceAssumptionVersion}
          description={t("energyPriceAssumptionsTooltip")}
        />
        <ProvenanceRow
          label={t("emissionsFactorAssumptions")}
          value={emissionsFactorVersion}
          description={t("emissionsFactorAssumptionsTooltip")}
        />
        <ProvenanceRow
          label={t("solarYieldAssumptions")}
          value={solarYieldAssumptionVersion}
          description={t("solarYieldAssumptionsTooltip")}
        />
        <ProvenanceRow
          label={t("currencyConversionSource")}
          value={currencyConversionSourceVersion}
          description={t("currencyConversionSourceTooltip")}
        />
      </dl>
    </div>
  );
}
