"use client";

import { useTranslations } from "next-intl";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/common/Card";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import { SERIES_YEARS } from "@/lib/calculation-engine/constants";
import {
  SCENARIO_KINDS,
  type ScenarioKind,
} from "@/lib/calculation-engine/types";
import type { ChartPoint, ResultsViewModel } from "@/lib/results-view-model";
import {
  COMPACT_VIEWPORT_MEDIA_QUERY,
  REDUCED_MOTION_MEDIA_QUERY,
  useMediaQuery,
} from "@/lib/use-media-query";

const FIRST_YEAR = 1;
const MIDDLE_YEAR = 5;
const ALL_YEAR_TICKS = Array.from(
  { length: SERIES_YEARS },
  (_, index) => index + FIRST_YEAR,
);
const COMPACT_YEAR_TICKS = [FIRST_YEAR, MIDDLE_YEAR, SERIES_YEARS];
const YEAR_AXIS_DOMAIN = [0, SERIES_YEARS];
const LINE_DRAW_DURATION_MS = 800;
const BREAK_EVEN_DOT_RADIUS = 3;
const AXIS_FONT_SIZE = 13;
const VALUE_AXIS_WIDTH = 64;
const INK_COLOR = "var(--ink)";
const MUTED_COLOR = "var(--muted)";
const AXIS_LINE_COLOR = "var(--line-strong)";
const SURFACE_COLOR = "var(--surface)";
const RANGE_BAND_COLOR = "var(--chart-payoff)";
const RANGE_LINE_COLOR = "var(--chart-profit)";

interface LineStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  legendClasses: string;
}

const LINE_STYLES: Record<ScenarioKind, LineStyle> = {
  PESSIMISTIC: {
    stroke: RANGE_LINE_COLOR,
    strokeWidth: 2,
    strokeDasharray: "2 5",
    legendClasses: "border-t-2 border-dotted border-chart-profit",
  },
  REALISTIC: {
    stroke: INK_COLOR,
    strokeWidth: 3,
    legendClasses: "border-t-[3px] border-ink",
  },
  OPTIMISTIC: {
    stroke: RANGE_LINE_COLOR,
    strokeWidth: 2,
    legendClasses: "border-t-2 border-chart-profit",
  },
};

function scenarioBand(point: ChartPoint) {
  return [point.PESSIMISTIC, point.OPTIMISTIC];
}

interface PaybackChartProps {
  chart: ResultsViewModel["chart"];
}

export default function PaybackChart({ chart }: PaybackChartProps) {
  const t = useTranslations("results.chart");
  const { money, compactMoney } = useResultsFormatters();
  const isCompactViewport = useMediaQuery(COMPACT_VIEWPORT_MEDIA_QUERY);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_MEDIA_QUERY);
  const isAnimated = !prefersReducedMotion;
  const cost = money(chart.costEuros);
  const caption =
    chart.breakEvenYear === null
      ? t("captionNever", { cost })
      : chart.breakEvenYearRange === null
        ? t("captionSingle", { cost, year: chart.breakEvenYear })
        : t("captionWithRange", {
            cost,
            year: chart.breakEvenYear,
            ...chart.breakEvenYearRange,
          });

  return (
    <Card as="section" className="text-left">
      <figure className="m-0 flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1.5">
            <Heading level={2} size="title">
              {t("title")}
            </Heading>
            <Text tone="muted">{t("subtitle")}</Text>
          </div>
          <ul className="flex list-none flex-wrap gap-x-5 gap-y-2">
            {SCENARIO_KINDS.map((kind) => (
              <li key={kind} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`w-6 ${LINE_STYLES[kind].legendClasses}`}
                />
                <Text as="span" size="small" tone="muted">
                  {t(`legend.${kind}`)}
                </Text>
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden="true" className="h-[200px] md:h-60 lg:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chart.points}>
              <XAxis
                dataKey="year"
                type="number"
                domain={YEAR_AXIS_DOMAIN}
                ticks={isCompactViewport ? COMPACT_YEAR_TICKS : ALL_YEAR_TICKS}
                tickFormatter={(year: number) =>
                  isCompactViewport || year === FIRST_YEAR
                    ? t("yearTick", { year })
                    : String(year)
                }
                tickLine={false}
                axisLine={{ stroke: AXIS_LINE_COLOR }}
                tick={{ fill: MUTED_COLOR, fontSize: AXIS_FONT_SIZE }}
              />
              <YAxis
                hide={isCompactViewport}
                width={VALUE_AXIS_WIDTH}
                tickFormatter={compactMoney}
                tickLine={false}
                axisLine={false}
                tick={{ fill: MUTED_COLOR, fontSize: AXIS_FONT_SIZE }}
              />
              <Area
                dataKey={scenarioBand}
                stroke="none"
                fill={RANGE_BAND_COLOR}
                fillOpacity={0.5}
                isAnimationActive={false}
              />
              <ReferenceLine
                y={chart.costEuros}
                stroke={INK_COLOR}
                strokeWidth={2}
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
                label={{
                  value: t("costLabel", {
                    cost: compactMoney(chart.costEuros),
                  }),
                  position: "insideTopLeft",
                  fill: INK_COLOR,
                  fontSize: AXIS_FONT_SIZE,
                  fontWeight: 600,
                }}
              />
              {SCENARIO_KINDS.map((kind) => (
                <Line
                  key={kind}
                  dataKey={kind}
                  type="linear"
                  dot={false}
                  activeDot={false}
                  stroke={LINE_STYLES[kind].stroke}
                  strokeWidth={LINE_STYLES[kind].strokeWidth}
                  strokeDasharray={LINE_STYLES[kind].strokeDasharray}
                  isAnimationActive={isAnimated}
                  animationDuration={LINE_DRAW_DURATION_MS}
                />
              ))}
              {chart.breakEvenPoints.map((point) => (
                <ReferenceDot
                  key={point.kind}
                  x={point.year}
                  y={point.savingsEuros}
                  r={BREAK_EVEN_DOT_RADIUS}
                  fill={LINE_STYLES[point.kind].stroke}
                  stroke={SURFACE_COLOR}
                  ifOverflow="extendDomain"
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <figcaption>
          <Text size="small" tone="muted">
            {caption}
          </Text>
        </figcaption>
        <div className="sr-only">
          <table>
            <caption>{t("tableCaption")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("tableYear")}</th>
                {SCENARIO_KINDS.map((kind) => (
                  <th key={kind} scope="col">
                    {t(`legend.${kind}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.points.map((point) => (
                <tr key={point.year}>
                  <th scope="row">{t("tableYearRow", { year: point.year })}</th>
                  {SCENARIO_KINDS.map((kind) => (
                    <td key={kind}>{money(point[kind])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    </Card>
  );
}
