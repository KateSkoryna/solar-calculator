"use client";

import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import UserProfileButton from "@/components/layout/UserProfileButton";
import type { WorkspaceFleet } from "@/lib/workspace-layout-loader";
import FleetSwitcher from "./FleetSwitcher";
import type { WorkspaceUser } from "./workspace-user";

interface WorkspaceTopBarProps {
  fleets: WorkspaceFleet[];
  currentFleetSlug: string;
  user: WorkspaceUser;
}

export default function WorkspaceTopBar({
  fleets,
  currentFleetSlug,
  user,
}: WorkspaceTopBarProps) {
  return (
    <header className="flex min-h-[72px] items-center justify-between gap-3 border-b border-line bg-ground px-4 lg:hidden">
      <FleetSwitcher
        fleets={fleets}
        currentFleetSlug={currentFleetSlug}
        variant="compact"
      />
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <UserProfileButton name={user.name} imageUrl={user.imageUrl} />
      </div>
    </header>
  );
}
