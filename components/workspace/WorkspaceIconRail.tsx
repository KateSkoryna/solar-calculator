"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { useWorkspaceNavLinks } from "./useWorkspaceNavLinks";

interface WorkspaceIconRailProps {
  currentFleetSlug: string;
}

export default function WorkspaceIconRail({
  currentFleetSlug,
}: WorkspaceIconRailProps) {
  const t = useTranslations("workspace");
  const navLinks = useWorkspaceNavLinks(currentFleetSlug);

  return (
    <aside className="sticky top-6 hidden w-[88px] shrink-0 self-start rounded-xl border border-line bg-side py-3 md:block lg:hidden">
      <nav aria-label={t("mainNavigation")} className="w-full px-2">
        <ul className="flex list-none flex-col gap-1">
          {navLinks.map(({ key, label, href, Icon, isCurrent }) => (
            <li key={key} className="mb-0">
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs font-semibold ${FOCUS_RING_CLASSES} ${
                  isCurrent
                    ? "bg-ink text-ground dark:bg-lime dark:text-on-lime"
                    : "text-ink hover:bg-soft"
                }`}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
