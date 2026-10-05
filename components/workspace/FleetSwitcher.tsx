"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LuChevronDown } from "react-icons/lu";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import type { WorkspaceFleet } from "@/lib/workspace-layout-loader";

type FleetSwitcherVariant = "sidebar" | "compact";

const VARIANT_CLASSES: Record<FleetSwitcherVariant, string> = {
  sidebar:
    "w-full flex-col items-start gap-0.5 rounded-md border border-line bg-surface px-3 py-2",
  compact:
    "max-w-[200px] rounded-full border border-line-strong bg-surface px-4",
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
        {hasSeveralFleets && (
          <LuChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-ink transition-transform duration-150 group-open:rotate-180"
          />
        )}
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

      <ul className="absolute left-0 top-[calc(100%+6px)] z-50 flex min-w-full list-none flex-col gap-1 rounded-md border border-line bg-surface p-2 shadow-hover">
        {fleets.map(({ id, name, slug }) => (
          <li key={id} className="mb-0">
            <Link
              href={`/${locale}/${slug}`}
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
