"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { useWorkspaceNavLinks } from "./useWorkspaceNavLinks";

interface WorkspaceTabBarProps {
  currentFleetSlug: string;
}

export default function WorkspaceTabBar({
  currentFleetSlug,
}: WorkspaceTabBarProps) {
  const t = useTranslations("workspace");
  const navLinks = useWorkspaceNavLinks(currentFleetSlug);

  return (
    <nav
      aria-label={t("mainNavigation")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-side pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="m-0 grid list-none auto-cols-fr grid-flow-col p-0">
        {navLinks.map(({ key, label, href, Icon, isCurrent }) => (
          <li key={key}>
            <Link
              href={href}
              aria-current={isCurrent ? "page" : undefined}
              className={`m-1 flex h-[68px] flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold ${FOCUS_RING_CLASSES} ${
                isCurrent
                  ? "bg-lime-soft text-lime-soft-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Icon aria-hidden="true" className="size-[22px]" />
              <span className="max-w-full truncate px-1">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
