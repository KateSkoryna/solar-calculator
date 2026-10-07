import { useTranslations } from "next-intl";
import MockScreen from "@/components/home/showcase/MockScreen";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import { KILOGRAMS_PER_TONNE } from "@/lib/calculation-engine/constants";
import {
  getHomeShowcase,
  SHOWCASE_FLEET_ADDRESS,
  SHOWCASE_FLEET_NAME,
} from "@/lib/home-showcase";
import { humaniseDuration } from "@/lib/results-view-model";

const NO_VALUE = "—";
const WORKSPACE_NAV_KEYS = [
  "overview",
  "vehicles",
  "calculations",
  "audit",
] as const;
const ACTIVE_NAV_KEY: (typeof WORKSPACE_NAV_KEYS)[number] = "overview";
const WINDOW_DOT_COUNT = 3;
const GROUP_ROW_CLASSES =
  "grid grid-cols-[2.2fr_1fr_1.2fr_1.4fr_1.6fr] items-center gap-[1.2cqw] border-t border-line px-[2cqw] py-[1.3cqw]";
const TILE_CLASSES = "flex flex-col gap-[0.6cqw] rounded-[1.6cqw] p-[1.8cqw]";
const TILE_VALUE_CLASSES =
  "font-display text-[2.3cqw] leading-none font-extrabold tabular-nums";

export default function DashboardScreen() {
  const t = useTranslations();
  const { money, tonnes, duration } = useResultsFormatters();
  const { groups, kpis, vehicleCount } = getHomeShowcase();
  const formatPayback = (paybackMonths: number | null) =>
    paybackMonths === null
      ? NO_VALUE
      : duration(humaniseDuration(paybackMonths));
  const neutralTiles = [
    {
      label: t("overview.kpis.averagePayback"),
      value: formatPayback(kpis.averagePaybackMonths),
      note: t("overview.kpis.basedOn", { count: kpis.calculatedGroupCount }),
    },
    {
      label: t("overview.kpis.co2Avoided"),
      value: tonnes(kpis.co2AvoidedKgPerYear / KILOGRAMS_PER_TONNE),
      note: t("overview.kpis.co2Note"),
    },
    {
      label: t("home.dashboard.notCalculated"),
      value: t("home.dashboard.groupCount", {
        count: kpis.notCalculatedYetCount,
      }),
      note: t("home.dashboard.runNow"),
    },
  ];

  return (
    <MockScreen
      label={t("home.dashboard.screenLabel")}
      className="@container overflow-hidden rounded-t-[20px] border border-b-0 border-line bg-ground text-left text-ink shadow-float"
    >
      <div className="flex h-[3.6cqw] items-center gap-[0.8cqw] border-b border-line bg-soft px-[1.6cqw]">
        {Array.from({ length: WINDOW_DOT_COUNT }, (_, dotIndex) => (
          <span
            key={dotIndex}
            className="size-[1cqw] rounded-full bg-line-strong"
          />
        ))}
        <span className="ml-[2cqw] flex h-[2cqw] max-w-[40cqw] flex-1 items-center rounded-full border border-line bg-surface px-[1.2cqw] text-[1.1cqw] text-muted">
          {SHOWCASE_FLEET_ADDRESS}
        </span>
      </div>
      <div className="grid grid-cols-[20cqw_minmax(0,1fr)]">
        <div className="flex flex-col gap-[1.6cqw] border-r border-line bg-side px-[1.4cqw] py-[2cqw] text-[1.3cqw]">
          <span className="flex flex-col gap-[0.2cqw] rounded-[1.2cqw] border border-line bg-surface p-[1cqw]">
            <span className="text-[1cqw] text-muted">
              {t("workspace.fleetLabel")}
            </span>
            <span className="font-semibold">{SHOWCASE_FLEET_NAME}</span>
          </span>
          <span className="flex flex-col gap-[0.4cqw] font-medium">
            {WORKSPACE_NAV_KEYS.map((navKey) => (
              <span
                key={navKey}
                className={`rounded-[1cqw] p-[1cqw] ${
                  navKey === ACTIVE_NAV_KEY
                    ? "bg-ink font-semibold text-ground"
                    : ""
                }`}
              >
                {t(`workspace.nav.${navKey}`)}
              </span>
            ))}
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-[2cqw] px-[3cqw] pt-[2.6cqw]">
          <div className="flex items-end justify-between gap-[2cqw]">
            <div className="flex flex-col gap-[0.4cqw]">
              <span className="text-[1.2cqw] text-muted">
                {SHOWCASE_FLEET_NAME} ·{" "}
                {t("home.dashboard.vehicles", { count: vehicleCount })} ·{" "}
                <span className="font-semibold">{t("home.sampleData")}</span>
              </span>
              <span className="font-display text-[3.2cqw] leading-tight font-extrabold tracking-[-0.02em]">
                {t("overview.title")}
              </span>
            </div>
            <span className="inline-flex h-[3.8cqw] items-center rounded-full bg-lime px-[1.8cqw] text-[1.3cqw] font-semibold whitespace-nowrap text-on-lime">
              + {t("overview.addVehicles")}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-[1.2cqw]">
            <div className={`bg-hero ${TILE_CLASSES}`}>
              <span className="text-[1.15cqw] font-semibold text-hero-muted">
                {t("overview.kpis.couldSave")}
              </span>
              <span className={`text-lime ${TILE_VALUE_CLASSES}`}>
                {money(kpis.couldSaveEurosPerYear)}
              </span>
              <span className="text-[1.05cqw] text-hero-muted">
                {t("overview.kpis.couldSaveNote")}
              </span>
            </div>
            {neutralTiles.map(({ label, value, note }) => (
              <div
                key={label}
                className={`border border-line bg-surface ${TILE_CLASSES}`}
              >
                <span className="text-[1.15cqw] font-semibold text-muted">
                  {label}
                </span>
                <span className={TILE_VALUE_CLASSES}>{value}</span>
                <span className="text-[1.05cqw] text-muted">{note}</span>
              </div>
            ))}
          </div>
          <div className="rounded-t-[1.8cqw] border border-b-0 border-line bg-surface text-[1.25cqw]">
            <div className="px-[2cqw] py-[1.5cqw] text-[1.5cqw] font-semibold">
              {t("overview.groups.title")}
            </div>
            {groups.map((group) => (
              <div key={group.id} className={GROUP_ROW_CLASSES}>
                <span className="font-semibold">{group.name}</span>
                <span className="text-muted">
                  {t("home.dashboard.groupLine", {
                    type: t(
                      `calculator.options.vehicleType.${group.vehicleType}`,
                    ),
                    count: group.quantity,
                  })}
                </span>
                <span className="text-muted">{group.city}</span>
                <span className="font-semibold">
                  {formatPayback(group.paybackMonths)}
                </span>
                <span
                  className={`justify-self-start rounded-full px-[1cqw] py-[0.5cqw] text-[1.05cqw] font-semibold ${
                    group.isCalculated
                      ? "bg-lime-soft text-lime-soft-ink"
                      : "bg-warn-soft text-warn-ink"
                  }`}
                >
                  {t(
                    `overview.groups.status.${
                      group.isCalculated ? "calculated" : "needsCalculation"
                    }`,
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockScreen>
  );
}
