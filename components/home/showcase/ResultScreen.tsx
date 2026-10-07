import { useTranslations } from "next-intl";
import MockScreen from "@/components/home/showcase/MockScreen";
import { useResultsContextLine } from "@/components/results/ResultsContextLine";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import { getHomeShowcase } from "@/lib/home-showcase";
import { SCROLL_REVEAL_CLASSES } from "@/lib/scroll-animation";

const FULL_PERCENT = 100;
const FIRST_CHART_YEAR = 1;
const TILE_CLASSES = "flex flex-col gap-[0.8cqw] rounded-[2cqw] p-[2.2cqw]";
const TILE_LABEL_CLASSES = "text-[1.25cqw] font-semibold";
const TILE_VALUE_CLASSES =
  "font-display text-[3.4cqw] leading-none font-extrabold tabular-nums";

export default function ResultScreen() {
  const t = useTranslations();
  const { money, tonnes, duration } = useResultsFormatters();
  const { summary, verdict, tiles, chart } = getHomeShowcase().result;
  const contextLine = useResultsContextLine(summary);
  const yearlyPoints = chart.points.filter(
    ({ year }) => year >= FIRST_CHART_YEAR,
  );
  const highestSavings = Math.max(
    chart.costEuros,
    ...yearlyPoints.map(({ REALISTIC }) => REALISTIC),
  );
  const shareOfChart = (euros: number) =>
    `${(euros / highestSavings) * FULL_PERCENT}%`;
  const neutralTiles = [
    {
      label: t("results.tiles.annualSavings"),
      value: money(tiles.annualSavingsEuros.realistic),
    },
    {
      label: t("results.tiles.oneTimeCost"),
      value: money(tiles.oneTimeCostEuros.realistic),
    },
    {
      label: t("results.tiles.co2Avoided"),
      value: tonnes(tiles.co2AvoidedTonnes.realistic),
    },
  ];

  return (
    <MockScreen
      label={t("home.result.screenLabel")}
      className={`@container overflow-hidden rounded-xl bg-ground text-left text-ink shadow-float ${SCROLL_REVEAL_CLASSES.screen}`}
    >
      <div className="flex flex-col gap-[2.6cqw] px-[4.4cqw] pt-[4cqw] pb-[3.6cqw]">
        <div className="flex flex-col gap-[1.2cqw]">
          <span className="flex items-center gap-[1cqw] text-[1.35cqw] text-muted">
            {contextLine}
            <span className="rounded-full bg-soft px-[1cqw] py-[0.4cqw] text-[1.05cqw] font-semibold">
              {t("home.sampleData")}
            </span>
          </span>
          <span
            data-testid="home-result-verdict"
            className="font-display text-[4.4cqw] leading-[1.1] font-extrabold tracking-[-0.03em]"
          >
            {verdict.duration === null
              ? t(`results.verdict.${verdict.variant}`)
              : t.rich(`results.verdict.${verdict.variant}`, {
                  duration: (sentenceEnd) => (
                    <span className="rounded-[1.2cqw] bg-lime px-[1cqw] text-on-lime">
                      {verdict.duration && duration(verdict.duration)}
                      {sentenceEnd}
                    </span>
                  ),
                })}
          </span>
          <span className="text-[1.7cqw] text-muted">
            {t("results.verdict.lead", {
              annualSavings: money(verdict.annualSavingsEuros),
            })}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-[1.6cqw]">
          {neutralTiles.map(({ label, value }) => (
            <div
              key={label}
              className={`border border-line bg-surface ${TILE_CLASSES}`}
            >
              <span className={`text-muted ${TILE_LABEL_CLASSES}`}>
                {label}
              </span>
              <span className={TILE_VALUE_CLASSES}>{value}</span>
            </div>
          ))}
          <div className={`bg-hero ${TILE_CLASSES}`}>
            <span className={`text-hero-muted ${TILE_LABEL_CLASSES}`}>
              {t("results.tiles.tenYearGain")}
            </span>
            <span className={`text-lime ${TILE_VALUE_CLASSES}`}>
              {money(tiles.tenYearGainEuros.realistic)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-[2cqw] rounded-[2.2cqw] border border-line bg-surface px-[3cqw] py-[2.6cqw]">
          <span className="font-display text-[2.2cqw] font-bold">
            {t("results.chart.title")}
          </span>
          <div className="relative flex h-[17cqw] items-end gap-[1.4cqw]">
            <span
              className="absolute inset-x-0 border-t-[0.2cqw] border-dashed border-ink"
              style={{ bottom: shareOfChart(chart.costEuros) }}
            />
            {yearlyPoints.map(({ year, REALISTIC }) => (
              <span
                key={year}
                className={`flex-1 rounded-t-[0.8cqw] ${SCROLL_REVEAL_CLASSES.bar} ${
                  REALISTIC >= chart.costEuros
                    ? "bg-chart-profit"
                    : "bg-chart-payoff"
                }`}
                style={{ height: shareOfChart(REALISTIC) }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[1.2cqw] text-muted">
            <span>{t("home.result.firstYear")}</span>
            {chart.breakEvenYear !== null && (
              <span>
                {t("home.result.paidOff", { year: chart.breakEvenYear })}
              </span>
            )}
            <span>
              {t("home.result.lastYear", { year: yearlyPoints.length })}
            </span>
          </div>
        </div>
      </div>
    </MockScreen>
  );
}
