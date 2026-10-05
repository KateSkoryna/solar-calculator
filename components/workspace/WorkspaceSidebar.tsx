"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Logo from "@/components/common/Logo";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import UserProfileButton from "@/components/layout/UserProfileButton";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { homePath } from "@/lib/public-paths";
import type { WorkspaceFleet } from "@/lib/workspace-layout-loader";
import FleetSwitcher from "./FleetSwitcher";
import type { WorkspaceUser } from "./workspace-user";
import { useWorkspaceNavLinks } from "./useWorkspaceNavLinks";

interface WorkspaceSidebarProps {
  fleets: WorkspaceFleet[];
  currentFleetSlug: string;
  user: WorkspaceUser;
}

export default function WorkspaceSidebar({
  fleets,
  currentFleetSlug,
  user,
}: WorkspaceSidebarProps) {
  const locale = useLocale();
  const t = useTranslations("workspace");
  const navLinks = useWorkspaceNavLinks(currentFleetSlug);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col gap-6 border-r border-line bg-side p-5 lg:flex">
      <Link
        href={homePath(locale)}
        className={`self-start rounded-full ${FOCUS_RING_CLASSES}`}
      >
        <Logo />
      </Link>

      <FleetSwitcher
        fleets={fleets}
        currentFleetSlug={currentFleetSlug}
        variant="sidebar"
      />

      <nav aria-label={t("mainNavigation")} className="flex-1">
        <ul className="flex list-none flex-col gap-1">
          {navLinks.map(({ key, label, href, Icon, isCurrent }) => (
            <li key={key} className="mb-0">
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

      <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <UserProfileButton
            name={user.name}
            imageUrl={user.imageUrl}
            opensUpward
          />
          <span className="truncate text-sm font-semibold text-ink">
            {user.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher opensUpward />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
