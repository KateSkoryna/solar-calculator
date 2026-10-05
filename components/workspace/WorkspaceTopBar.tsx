"use client";

import type { WorkspaceFleet } from "@/lib/workspace-layout-loader";
import FleetSwitcher from "./FleetSwitcher";

interface WorkspaceTopBarProps {
  fleets: WorkspaceFleet[];
  currentFleetSlug: string;
}

export default function WorkspaceTopBar({
  fleets,
  currentFleetSlug,
}: WorkspaceTopBarProps) {
  return (
    <div className="flex items-center pt-4 md:pt-6 lg:hidden">
      <FleetSwitcher
        fleets={fleets}
        currentFleetSlug={currentFleetSlug}
        variant="compact"
      />
    </div>
  );
}
