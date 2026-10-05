"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ActivityCard, {
  type ActivityUserOption,
} from "@/components/activity/ActivityCard";
import SegmentedControl, {
  getTabId,
} from "@/components/common/SegmentedControl";
import TeamCard from "./TeamCard";
import type { TeamMember } from "./team-member";

const ACTIVITY_TAB_ID = "activity";
const TEAM_TAB_ID = "team";
const ACTIVITY_PANEL_ID = "activity-panel";
const TEAM_PANEL_ID = "team-panel";

interface TeamAndActivityViewProps {
  fleetId: string;
  members: TeamMember[];
  currentUserId: string;
  canManageTeam: boolean;
  canSeeActivity: boolean;
}

function panelVisibilityClasses(isSelected: boolean) {
  return isSelected ? "block" : "hidden md:block";
}

export default function TeamAndActivityView({
  fleetId,
  members,
  currentUserId,
  canManageTeam,
  canSeeActivity,
}: TeamAndActivityViewProps) {
  const t = useTranslations("audit");
  const [selectedTabId, setSelectedTabId] = useState(ACTIVITY_TAB_ID);
  const activityUsers: ActivityUserOption[] = members.map((member) => ({
    id: member.userId,
    label: member.name ?? member.email,
  }));

  return (
    <div className="flex flex-col gap-6">
      {canSeeActivity && (
        <div className="md:hidden">
          <SegmentedControl
            label={t("tabsLabel")}
            tabs={[
              {
                id: ACTIVITY_TAB_ID,
                label: t("tabActivity"),
                panelId: ACTIVITY_PANEL_ID,
              },
              { id: TEAM_TAB_ID, label: t("tabTeam"), panelId: TEAM_PANEL_ID },
            ]}
            selectedTabId={selectedTabId}
            onSelectTab={setSelectedTabId}
          />
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[400px_1fr]">
        <div
          role={canSeeActivity ? "tabpanel" : undefined}
          id={TEAM_PANEL_ID}
          aria-labelledby={canSeeActivity ? getTabId(TEAM_TAB_ID) : undefined}
          className={panelVisibilityClasses(
            !canSeeActivity || selectedTabId === TEAM_TAB_ID,
          )}
        >
          <TeamCard
            fleetId={fleetId}
            members={members}
            currentUserId={currentUserId}
            canManageTeam={canManageTeam}
          />
        </div>

        {canSeeActivity && (
          <div
            role="tabpanel"
            id={ACTIVITY_PANEL_ID}
            aria-labelledby={getTabId(ACTIVITY_TAB_ID)}
            className={panelVisibilityClasses(
              selectedTabId === ACTIVITY_TAB_ID,
            )}
          >
            <ActivityCard fleetId={fleetId} users={activityUsers} />
          </div>
        )}
      </div>
    </div>
  );
}
