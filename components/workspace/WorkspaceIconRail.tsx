"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Logo from "@/components/common/Logo";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { homePath } from "@/lib/public-paths";
import { useWorkspaceNavLinks } from "./useWorkspaceNavLinks";

interface WorkspaceIconRailProps {
  currentFleetSlug: string;
}

export default function WorkspaceIconRail({
  currentFleetSlug,
}: WorkspaceIconRailProps) {
  const locale = useLocale();
  const t = useTranslations("workspace");
  const navLinks = useWorkspaceNavLinks(currentFleetSlug);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center gap-6 border-r border-line bg-side py-5 md:flex lg:hidden">
      <Link
        href={homePath(locale)}
        aria-label={t("home")}
        className={`rounded-full ${FOCUS_RING_CLASSES}`}
      >
        <Logo className="[&>span:last-child]:sr-only" />
      </Link>

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
