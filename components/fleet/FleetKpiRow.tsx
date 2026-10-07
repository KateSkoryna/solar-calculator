import { useFormatter, useTranslations } from "next-intl";
import StatTile from "@/components/results/StatTile";
import { KILOGRAMS_PER_TONNE } from "@/lib/calculation-engine/constants";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import type { FleetKpis } from "@/lib/fleet-dashboard";
import { humaniseDuration, type DurationParts } from "@/lib/results-view-model";

const NO_VALUE = "—";
const NON_BREAKING_SPACE = "\u00a0";

interface FleetKpiRowProps {
  kpis: FleetKpis;
  vehicleCount: number;
  groupCount: number;
}

export default function FleetKpiRow({
  kpis,
  vehicleCount,
  groupCount,
}: FleetKpiRowProps) {
  const t = useTranslations("overview.kpis");
  const format = useFormatter();
  const { money, tonnes, duration } = useResultsFormatters();
  const hasCalculatedGroups = kpis.calculatedGroupCount > 0;
  const yearsAboveMonths = ({ years, months }: DurationParts) =>
    [
      years > 0 ? duration({ years, months: 0 }) : null,
      months > 0 ? duration({ years: 0, months }) : null,
    ]
      .filter((part) => part !== null)
      .map((part) => part.replaceAll(" ", NON_BREAKING_SPACE))
      .join("\n");
  const withoutPaybackNote = t("withoutPayback", {
    count: kpis.groupsWithoutPaybackCount,
  });
  const paybackExplanation = (() => {
    if (!hasCalculatedGroups) return t("noneCalculated");
    if (kpis.averagePaybackMonths === null) return withoutPaybackNote;
    const basedOn = t("basedOn", { count: kpis.calculatedGroupCount });
    return kpis.groupsWithoutPaybackCount > 0
      ? `${basedOn} · ${withoutPaybackNote}`
      : basedOn;
  })();

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
      <StatTile
        emphasis
        label={t("couldSave")}
        value={
          hasCalculatedGroups ? money(kpis.couldSaveEurosPerYear) : NO_VALUE
        }
        explanation={t("couldSaveNote")}
      />
      <StatTile
        valueOnTwoLines
        label={t("averagePayback")}
        value={
          kpis.averagePaybackMonths === null
            ? NO_VALUE
            : yearsAboveMonths(humaniseDuration(kpis.averagePaybackMonths))
        }
        explanation={paybackExplanation}
      />
      <StatTile
        label={t("co2Avoided")}
        value={
          hasCalculatedGroups
            ? tonnes(kpis.co2AvoidedKgPerYear / KILOGRAMS_PER_TONNE)
            : NO_VALUE
        }
        explanation={t("co2Note")}
      />
      <StatTile
        label={t("vehicles")}
        value={format.number(vehicleCount)}
        explanation={t("inGroups", { count: groupCount })}
      />
    </div>
  );
}
