"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import DropdownChevron from "@/components/common/DropdownChevron";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { fleetOverviewPath } from "@/lib/workspace-path";
import type { WorkspaceFleet } from "@/lib/workspace-layout-loader";

type FleetSwitcherVariant = "sidebar" | "compact";

const VARIANT_CLASSES: Record<FleetSwitcherVariant, string> = {
  sidebar:
    "w-full flex-col items-start gap-0.5 rounded-md border border-line bg-surface py-2 pl-4 pr-3",
  compact:
    "max-w-[200px] rounded-full border border-line-strong bg-surface pl-4 pr-3",
};

interface FleetSwitcherProps {
  fleets: WorkspaceFleet[];
  currentFleetSlug: string;
  variant: FleetSwitcherVariant;
}

export default function FleetSwitcher({
  fleets,
  currentFleetSlug,
  variant,
}: FleetSwitcherProps) {
  const locale = useLocale();
  const t = useTranslations("workspace");
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const currentFleet = fleets.find(({ slug }) => slug === currentFleetSlug);
  const currentFleetName = currentFleet?.name ?? currentFleetSlug;
  const hasSeveralFleets = fleets.length > 1;
  const isSidebar = variant === "sidebar";
  const menuPositionClasses = isSidebar
    ? "bottom-[calc(100%+6px)]"
    : "top-[calc(100%+6px)]";
  const labelClasses = `flex min-h-11 items-center gap-2 ${VARIANT_CLASSES[variant]}`;

  const content = (
    <>
      {isSidebar && (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("fleetLabel")}
        </span>
      )}
      <span className="flex w-full min-w-0 items-center justify-between gap-2">
        <span className="truncate text-[15px] font-semibold text-ink">
          {currentFleetName}
        </span>
        {hasSeveralFleets && <DropdownChevron className="text-ink" />}
      </span>
    </>
  );

  if (!hasSeveralFleets) {
    return (
      <div data-testid="fleet-label" className={labelClasses}>
        {content}
      </div>
    );
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        aria-label={t("switchFleet")}
        className={`cursor-pointer list-none hover:border-ink ${labelClasses} ${FOCUS_RING_CLASSES} [&::-webkit-details-marker]:hidden`}
      >
        {content}
      </summary>

      <ul
        className={`absolute left-0 z-50 flex min-w-full list-none flex-col gap-1 rounded-md border border-line bg-surface p-2 shadow-hover ${menuPositionClasses}`}
      >
        {fleets.map(({ id, name, slug }) => (
          <li key={id} className="mb-0">
            <Link
              href={fleetOverviewPath(locale, slug)}
              aria-current={slug === currentFleetSlug ? "true" : undefined}
              onClick={() => {
                if (detailsRef.current) detailsRef.current.open = false;
              }}
              className={`block rounded-sm px-3 py-2 text-sm font-semibold text-ink hover:bg-soft aria-[current]:bg-soft ${FOCUS_RING_CLASSES}`}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
