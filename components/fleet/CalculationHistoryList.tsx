"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { LuChevronRight } from "react-icons/lu";
import DropdownChevron from "@/components/common/DropdownChevron";
import Card from "@/components/common/Card";
import { useVehicleDisplayName } from "@/components/fleet/useVehicleDisplayName";
import GroupStatusPill from "@/components/fleet/GroupStatusPill";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import {
  CALCULATION_SORT_OPTIONS,
  DEFAULT_CALCULATION_SORT,
  sortCalculationHistory,
  type CalculationSortOption,
} from "@/lib/calculation-history-sort";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import type { CalculationHistoryRow } from "@/lib/fleet-calculation-history";
import {
  isCurrentAssumptionVersion,
  wasEditedAfter,
} from "@/lib/fleet-group-status";
import { humaniseDuration } from "@/lib/results-view-model";
import { fleetCalculationPath } from "@/lib/workspace-path";

const NO_VALUE = "—";
const ROW_GRID_CLASSES =
  "lg:grid lg:grid-cols-[2fr_90px_1.4fr_1.4fr_1.4fr] lg:items-center lg:gap-4 lg:[&>span:not(:first-child)]:text-center";

interface CalculationHistoryListProps {
  rows: CalculationHistoryRow[];
  currentAssumptionSetVersion: string;
  locale: string;
  fleetSlug: string;
}

export default function CalculationHistoryList({
  rows,
  currentAssumptionSetVersion,
  locale,
  fleetSlug,
}: CalculationHistoryListProps) {
  const t = useTranslations("calculations.history");
  const tGroups = useTranslations("overview.groups");
  const format = useFormatter();
  const { duration } = useResultsFormatters();
  const displayName = useVehicleDisplayName();
  const sortId = useId();
  const [sortOption, setSortOption] = useState<CalculationSortOption>(
    DEFAULT_CALCULATION_SORT,
  );
  const sortedRows = sortCalculationHistory(rows, sortOption);

  const formatDate = (date: Date) =>
    format.dateTime(date, { dateStyle: "medium" });

  const paybackLabel = ({
    hasResult,
    paybackMonths,
  }: CalculationHistoryRow) => {
    if (!hasResult) return NO_VALUE;
    return paybackMonths === null
      ? tGroups("doesNotPayOff")
      : duration(humaniseDuration(paybackMonths));
  };

  const isCurrent = ({
    hasResult,
    assumptionSetVersion,
    vehicleEditedAt,
    createdAt,
  }: CalculationHistoryRow) =>
    hasResult &&
    assumptionSetVersion !== null &&
    isCurrentAssumptionVersion(
      assumptionSetVersion,
      currentAssumptionSetVersion,
    ) &&
    !wasEditedAfter(vehicleEditedAt, createdAt);

  return (
    <Card
      as="section"
      title={t("title")}
      action={
        <div className="relative">
          <label htmlFor={sortId} className="sr-only">
            {t("sort.label")}
          </label>
          <select
            id={sortId}
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value as CalculationSortOption)
            }
            className="h-10 w-full appearance-none rounded-full border border-line-strong bg-surface pr-10 pl-4 text-sm font-semibold text-ink focus:border-ink focus:outline-none"
          >
            {CALCULATION_SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`sort.options.${option}`)}
              </option>
            ))}
          </select>
          <DropdownChevron
            rotatesWhenOpen={false}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink"
          />
        </div>
      }
    >
      <div
        aria-hidden="true"
        className={`hidden border-b border-line pb-3 text-[13px] font-semibold text-muted ${ROW_GRID_CLASSES}`}
      >
        <span>{t("columns.vehicle")}</span>
        <span>{t("columns.count")}</span>
        <span>{t("columns.date")}</span>
        <span>{tGroups("columns.paysOffIn")}</span>
        <span>{tGroups("columns.status")}</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:gap-0">
        {sortedRows.map((row) => (
          <li key={row.id}>
            <Link
              href={fleetCalculationPath(locale, fleetSlug, row.id)}
              className={`relative flex flex-col gap-2 rounded-lg border border-line p-4 hover:bg-soft lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-4 ${ROW_GRID_CLASSES} ${FOCUS_RING_CLASSES}`}
            >
              <span className="pr-8 font-semibold text-ink lg:pr-0">
                {displayName(row)}
              </span>
              <span className="text-sm text-muted lg:text-[15px] lg:text-ink">
                <span className="lg:hidden">{t("columns.count")}: </span>
                {format.number(row.quantity)}
              </span>
              <span className="text-sm text-muted lg:text-[15px] lg:text-ink">
                {formatDate(row.createdAt)}
              </span>
              <span className="text-[15px] text-ink">
                <span className="text-sm text-muted lg:hidden">
                  {tGroups("columns.paysOffIn")}:{" "}
                </span>
                {paybackLabel(row)}
              </span>
              <span>
                <GroupStatusPill isCalculated={isCurrent(row)} />
              </span>
              <LuChevronRight
                aria-hidden="true"
                className="absolute top-4 right-4 size-5 text-muted lg:hidden"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
