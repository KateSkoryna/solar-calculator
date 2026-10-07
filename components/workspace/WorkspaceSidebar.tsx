"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import type { WorkspaceFleet } from "@/lib/workspace-layout-loader";
import FleetSwitcher from "./FleetSwitcher";
import { useWorkspaceNavLinks } from "./useWorkspaceNavLinks";

interface WorkspaceSidebarProps {
  fleets: WorkspaceFleet[];
  currentFleetSlug: string;
}

export default function WorkspaceSidebar({
  fleets,
  currentFleetSlug,
}: WorkspaceSidebarProps) {
  const t = useTranslations("workspace");
  const navLinks = useWorkspaceNavLinks(currentFleetSlug);

  return (
    <aside className="sticky top-6 z-10 hidden w-[260px] shrink-0 flex-col gap-6 self-start rounded-xl border border-line bg-side p-5 lg:flex">
      <nav aria-label={t("mainNavigation")} className="flex-1">
        <ul className="flex list-none flex-col gap-1">
          {navLinks.map(({ key, label, href, Icon, isCurrent }) => (
            <li key={key}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-[15px] font-semibold ${FOCUS_RING_CLASSES} ${
                  isCurrent
                    ? "bg-ink text-ground dark:bg-lime dark:text-on-lime"
                    : "text-ink hover:bg-soft"
                }`}
              >
                <Icon aria-hidden="true" className="size-[18px]" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <FleetSwitcher
        fleets={fleets}
        currentFleetSlug={currentFleetSlug}
        variant="sidebar"
      />
    </aside>
  );
}
