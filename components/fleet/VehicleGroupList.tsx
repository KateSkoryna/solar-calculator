"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { LuChevronRight, LuSearch } from "react-icons/lu";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import GroupStatusPill from "@/components/fleet/GroupStatusPill";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import {
  isCalculatedWithCurrentAssumptions,
  type FleetVehicleGroup,
} from "@/lib/fleet-group-status";
import { humaniseDuration } from "@/lib/results-view-model";
import {
  COMPACT_VIEWPORT_MEDIA_QUERY,
  useMediaQuery,
} from "@/lib/use-media-query";

const VEHICLE_TYPE_MESSAGE_NAMESPACE = "calculator.options.vehicleType";
const NO_VALUE = "—";
const ROW_GRID_CLASSES =
  "lg:grid lg:grid-cols-[2fr_1fr_70px_1.2fr_1.3fr_1.2fr_1.3fr] lg:items-center lg:gap-4 lg:[&>span:not(:first-child)]:text-center";
const ACTIONS_COLUMN_CLASSES = "lg:w-[300px] lg:shrink-0";
const ACTIONS_HEADER_PADDING_CLASSES = "lg:pr-[316px]";

interface VehicleGroupListProps {
  groups: FleetVehicleGroup[];
  currentAssumptionSetVersion: string;
  fleetPath: string;
  vehiclesPath: string;
  renderActions?: (group: FleetVehicleGroup) => ReactNode;
}

export default function VehicleGroupList({
  groups,
  currentAssumptionSetVersion,
  fleetPath,
  vehiclesPath,
  renderActions,
}: VehicleGroupListProps) {
  const t = useTranslations("overview.groups");
  const tVehicleType = useTranslations(VEHICLE_TYPE_MESSAGE_NAMESPACE);
  const { duration } = useResultsFormatters();
  const locale = useLocale();
  const format = useFormatter();
  const [searchText, setSearchText] = useState("");
  const isSearchHidden = useMediaQuery(COMPACT_VIEWPORT_MEDIA_QUERY);
  const normalizedSearch = isSearchHidden
    ? ""
    : searchText.trim().toLowerCase();

  const visibleGroups = groups.filter(
    ({ manufacturer, model, city, vehicleType }) =>
      [manufacturer, model, city, tVehicleType(vehicleType)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
  );

  const paybackLabel = (group: FleetVehicleGroup) => {
    if (
      !isCalculatedWithCurrentAssumptions(group, currentAssumptionSetVersion)
    ) {
      return NO_VALUE;
    }
    const { paybackMonths } = group.latestCalculation;
    return paybackMonths === null
      ? t("doesNotPayOff")
      : duration(humaniseDuration(paybackMonths));
  };

  const calculatedOnLabel = ({ latestCalculation }: FleetVehicleGroup) =>
    latestCalculation
      ? format.dateTime(latestCalculation.calculatedAt, { dateStyle: "medium" })
      : NO_VALUE;

  const rowPath = ({ latestCalculation }: FleetVehicleGroup) =>
    latestCalculation
      ? `${fleetPath}/calculations/${latestCalculation.id}`
      : vehiclesPath;

  return (
    <Card
      as="section"
      title={t("title")}
      action={
        <div className="relative hidden w-[260px] md:block">
          <LuSearch
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            aria-label={t("search")}
            placeholder={t("search")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className={`h-10 w-full rounded-full border border-line-strong bg-surface pr-4 pl-9 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none`}
          />
        </div>
      }
    >
      <div
        aria-hidden="true"
        className={`hidden border-b border-line pb-3 text-[13px] font-semibold text-muted ${ROW_GRID_CLASSES} ${renderActions ? ACTIONS_HEADER_PADDING_CLASSES : ""}`}
      >
        <span>{t("columns.vehicle")}</span>
        <span>{t("columns.type")}</span>
        <span>{t("columns.count")}</span>
        <span>{t("columns.location")}</span>
        <span>{t("columns.paysOffIn")}</span>
        <span>{t("columns.calculatedOn")}</span>
        <span>{t("columns.status")}</span>
      </div>

      {visibleGroups.length === 0 ? (
        <Text tone="muted" className="pt-4">
          {t("noMatch")}
        </Text>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:gap-0">
          {visibleGroups.map((group) => {
            const isCalculated = isCalculatedWithCurrentAssumptions(
              group,
              currentAssumptionSetVersion,
            );
            const vehicleTypeLabel = tVehicleType(group.vehicleType);

            return (
              <li
                key={group.vehicleId}
                className="mb-0 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4 lg:border-b lg:border-line"
              >
                <Link
                  href={rowPath(group)}
                  className={`relative flex flex-col gap-2 rounded-lg border border-line p-4 hover:bg-soft lg:min-w-0 lg:flex-1 lg:rounded-none lg:border-0 lg:px-0 lg:py-4 ${ROW_GRID_CLASSES} ${FOCUS_RING_CLASSES}`}
                >
                  <span className="pr-8 font-semibold text-ink lg:pr-0">
                    {group.manufacturer} {group.model}
                  </span>
                  <span className="text-sm text-muted lg:hidden">
                    {vehicleTypeLabel} · {group.quantity} · {group.city}
                  </span>
                  <span className="hidden text-[15px] text-ink lg:block">
                    {vehicleTypeLabel}
                  </span>
                  <span className="hidden text-[15px] text-ink lg:block">
                    {new Intl.NumberFormat(locale).format(group.quantity)}
                  </span>
                  <span className="hidden text-[15px] text-ink lg:block">
                    {group.city}
                  </span>
                  <span className="text-[15px] text-ink">
                    <span className="text-sm text-muted lg:hidden">
                      {t("columns.paysOffIn")}:{" "}
                    </span>
                    {paybackLabel(group)}
                  </span>
                  <span className="text-sm text-muted lg:text-[15px] lg:text-ink">
                    <span className="lg:hidden">
                      {t("columns.calculatedOn")}:{" "}
                    </span>
                    {calculatedOnLabel(group)}
                  </span>
                  <span>
                    <GroupStatusPill isCalculated={isCalculated} />
                  </span>
                  <LuChevronRight
                    aria-hidden="true"
                    className="absolute top-4 right-4 size-5 text-muted lg:hidden"
                  />
                </Link>
                {renderActions && (
                  <div className={ACTIONS_COLUMN_CLASSES}>
                    {renderActions(group)}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
