import { useTranslations } from "next-intl";
import MockScreen from "@/components/home/showcase/MockScreen";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import { getHomeShowcase } from "@/lib/home-showcase";
import { humaniseDuration } from "@/lib/results-view-model";
import {
  SCROLL_REVEAL_CLASSES,
  SCROLL_STAGGER_CLASSES,
} from "@/lib/scroll-animation";

const PREVIEW_GROUP_COUNT = 3;

export default function WorkspacePreview() {
  const t = useTranslations();
  const { money, duration } = useResultsFormatters();
  const { groups, kpis } = getHomeShowcase();
  const previewGroups = groups.slice(-PREVIEW_GROUP_COUNT);

  return (
    <MockScreen
      label={t("home.features.workspace.previewLabel")}
      className="flex flex-col gap-3.5 rounded-[36px] bg-soft p-5 text-left md:p-10 lg:p-12"
    >
      <div
        className={`flex flex-col gap-1.5 rounded-xl bg-hero p-6 shadow-hover ${SCROLL_REVEAL_CLASSES.rise}`}
      >
        <span className="text-sm font-semibold text-hero-muted">
          {t("overview.kpis.couldSave")} · {t("home.sampleData")}
        </span>
        <span className="font-display text-[44px] leading-none font-extrabold text-lime tabular-nums">
          {money(kpis.couldSaveEurosPerYear)}
        </span>
        <span className="text-[13px] text-hero-muted">
          {t("overview.kpis.couldSaveNote")}
        </span>
      </div>
      {previewGroups.map((group, groupIndex) => (
        <div
          key={group.id}
          className={`flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4.5 py-4 text-ink ${SCROLL_REVEAL_CLASSES.rise} ${SCROLL_STAGGER_CLASSES[groupIndex + 1]}`}
        >
          <span className="flex flex-col gap-0.5">
            <span className="font-semibold">{group.name}</span>
            <span className="text-sm text-muted">
              {t("home.dashboard.groupLine", {
                type: t(`calculator.options.vehicleType.${group.vehicleType}`),
                count: group.quantity,
              })}{" "}
              · {group.city}
            </span>
          </span>
          <span
            className={`rounded-full px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap ${
              group.paybackMonths === null
                ? "bg-warn-soft text-warn-ink"
                : "bg-lime-soft text-lime-soft-ink"
            }`}
          >
            {group.paybackMonths === null
              ? t("overview.groups.status.needsCalculation")
              : duration(humaniseDuration(group.paybackMonths))}
          </span>
        </div>
      ))}
    </MockScreen>
  );
}
