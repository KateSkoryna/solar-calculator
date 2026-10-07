import { useTranslations } from "next-intl";
import SectionIntro from "@/components/home/SectionIntro";
import PhoneFrame from "@/components/home/showcase/PhoneFrame";
import PageContainer from "@/components/layout/PageContainer";
import { useResultsContextLine } from "@/components/results/ResultsContextLine";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import { DISTANCE_BANDS } from "@/lib/assumptions/types";
import { KILOGRAMS_PER_TONNE } from "@/lib/calculation-engine/constants";
import { HOME_EXAMPLE_QUICK_CHECK } from "@/lib/home-example";
import { getHomeShowcase, SHOWCASE_FLEET_NAME } from "@/lib/home-showcase";
import { humaniseDuration } from "@/lib/results-view-model";
import { SCROLL_DRIFT_CLASSES } from "@/lib/scroll-animation";

const MOBILE_TITLE_ID = "mobile-title";
const PREVIEW_STEP_NUMBER = 2;
const CALCULATOR_STEP_COUNT = 4;
const PHONE_GROUP_COUNT = 2;
const PHONE_CARD_CLASSES =
  "flex flex-col gap-1 rounded-md border border-line bg-surface p-3.5";
const PHONE_LABEL_CLASSES = "text-xs font-semibold text-muted";
const PHONE_VALUE_CLASSES =
  "font-display text-[22px] leading-none font-extrabold tabular-nums";

export default function MobileShowcase() {
  const t = useTranslations();
  const { money, tonnes, duration } = useResultsFormatters();
  const { result, groups, kpis } = getHomeShowcase();
  const contextLine = useResultsContextLine(result.summary);

  return (
    <section
      aria-labelledby={MOBILE_TITLE_ID}
      className="overflow-clip bg-hero"
    >
      <PageContainer className="flex flex-col items-center gap-12 pt-16 md:pt-20 lg:gap-14 lg:pt-28">
        <SectionIntro
          eyebrow={t("home.mobile.eyebrow")}
          title={t("home.mobile.title")}
          titleId={MOBILE_TITLE_ID}
          lead={t("home.mobile.lead")}
          onDark
          centered
        />
        <div className="flex flex-wrap items-end justify-center gap-8">
          <PhoneFrame
            label={t("home.mobile.calculatorLabel")}
            className={`hidden md:block ${SCROLL_DRIFT_CLASSES.fast}`}
          >
            <span className={PHONE_LABEL_CLASSES}>
              {t("calculator.stepIndicator.summary", {
                current: PREVIEW_STEP_NUMBER,
                total: CALCULATOR_STEP_COUNT,
                label: t("calculator.steps.dailyDriving"),
              })}
            </span>
            <div className="h-1.5 overflow-hidden rounded-full bg-track">
              <div className="h-full w-1/2 rounded-full bg-chart-profit" />
            </div>
            <span className="font-display text-[21px] leading-[1.15] font-extrabold tracking-[-0.02em]">
              {t("calculator.stepContent.dailyDriving.title")}
            </span>
            {DISTANCE_BANDS.map((distanceBand) => (
              <div
                key={distanceBand}
                className={`flex flex-col gap-0.5 rounded-md border px-3.5 py-3 ${
                  distanceBand === HOME_EXAMPLE_QUICK_CHECK.distanceBand
                    ? "border-ink bg-lime-soft"
                    : "border-line bg-surface"
                }`}
              >
                <span className="text-sm font-semibold">
                  {t(`calculator.options.distanceBand.${distanceBand}`)}
                </span>
                <span className="text-xs text-muted">
                  {t(`calculator.options.distanceBand.${distanceBand}Example`)}
                </span>
              </div>
            ))}
            <div className="mt-auto flex h-13 items-center justify-center rounded-t-full bg-lime text-[15px] font-semibold text-on-lime">
              {t("calculator.actions.continue")}
            </div>
          </PhoneFrame>

          <PhoneFrame
            label={t("home.mobile.dashboardLabel")}
            size="tall"
            className={SCROLL_DRIFT_CLASSES.medium}
          >
            <span className="inline-flex h-9 items-center self-start rounded-full border border-line bg-surface px-3 text-[13px] font-semibold">
              {SHOWCASE_FLEET_NAME}
            </span>
            <span className="font-display text-2xl leading-tight font-extrabold tracking-[-0.02em]">
              {t("overview.title")}
            </span>
            <div className="flex flex-col gap-1 rounded-lg bg-hero p-4.5">
              <span className="text-[13px] font-semibold text-hero-muted">
                {t("overview.kpis.couldSave")} · {t("home.sampleData")}
              </span>
              <span className="font-display text-4xl leading-none font-extrabold text-lime tabular-nums">
                {money(kpis.couldSaveEurosPerYear)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className={PHONE_CARD_CLASSES}>
                <span className={PHONE_LABEL_CLASSES}>
                  {t("overview.kpis.averagePayback")}
                </span>
                <span className="font-display text-base leading-tight font-extrabold">
                  {kpis.averagePaybackMonths !== null &&
                    duration(humaniseDuration(kpis.averagePaybackMonths))}
                </span>
              </div>
              <div className={PHONE_CARD_CLASSES}>
                <span className={PHONE_LABEL_CLASSES}>
                  {t("overview.kpis.co2Avoided")}
                </span>
                <span className="font-display text-base leading-tight font-extrabold">
                  {tonnes(kpis.co2AvoidedKgPerYear / KILOGRAMS_PER_TONNE)}
                </span>
              </div>
            </div>
            <span className="mt-1 font-semibold">
              {t("overview.groups.title")}
            </span>
            {groups.slice(0, PHONE_GROUP_COUNT).map((group) => (
              <div key={group.id} className={PHONE_CARD_CLASSES}>
                <span className="text-[15px] font-semibold">{group.name}</span>
                <span className="text-[13px] text-muted">
                  {t("home.dashboard.groupLine", {
                    type: t(
                      `calculator.options.vehicleType.${group.vehicleType}`,
                    ),
                    count: group.quantity,
                  })}{" "}
                  · {group.city}
                </span>
              </div>
            ))}
          </PhoneFrame>

          <PhoneFrame
            label={t("home.mobile.resultLabel")}
            className={`hidden lg:block ${SCROLL_DRIFT_CLASSES.slow}`}
          >
            <span className={PHONE_LABEL_CLASSES}>
              {contextLine} · {t("home.sampleData")}
            </span>
            <span className="font-display text-[23px] leading-[1.15] font-extrabold tracking-[-0.02em]">
              {result.verdict.duration === null
                ? t(`results.verdict.${result.verdict.variant}`)
                : t.rich(`results.verdict.${result.verdict.variant}`, {
                    duration: (sentenceEnd) => (
                      <span className="rounded-sm bg-lime px-1.5 text-on-lime">
                        {result.verdict.duration &&
                          duration(result.verdict.duration)}
                        {sentenceEnd}
                      </span>
                    ),
                  })}
            </span>
            <div className={PHONE_CARD_CLASSES}>
              <span className={PHONE_LABEL_CLASSES}>
                {t("results.tiles.annualSavings")}
              </span>
              <span className={PHONE_VALUE_CLASSES}>
                {money(result.tiles.annualSavingsEuros.realistic)}
              </span>
            </div>
            <div className={PHONE_CARD_CLASSES}>
              <span className={PHONE_LABEL_CLASSES}>
                {t("results.tiles.co2Avoided")}
              </span>
              <span className={PHONE_VALUE_CLASSES}>
                {tonnes(result.tiles.co2AvoidedTonnes.realistic)}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 rounded-t-md bg-hero p-3.5">
              <span className="text-xs font-semibold text-hero-muted">
                {t("results.tiles.tenYearGain")}
              </span>
              <span className={`text-lime ${PHONE_VALUE_CLASSES}`}>
                {money(result.tiles.tenYearGainEuros.realistic)}
              </span>
            </div>
          </PhoneFrame>
        </div>
      </PageContainer>
    </section>
  );
}
