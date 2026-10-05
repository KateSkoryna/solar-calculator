import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { Role } from "@/app/generated/prisma/enums";
import { DISPLAY_TIME_ZONE } from "@/i18n";
import { AuditAction, AuditEntityType } from "@/lib/audit";
import englishMessages from "@/messages/en.json";
import TeamAndActivityView from "./TeamAndActivityView";
import type { TeamMember } from "./team-member";

const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const teamMessages = englishMessages.team;
const auditMessages = englishMessages.audit;
const RAW_ENUM_NAME_PATTERN = /[A-Z]+_[A-Z]+/;

const OWNER: TeamMember = {
  userId: "user_owner",
  name: "Alice Owner",
  email: "alice@example.com",
  imageUrl: null,
  role: Role.OWNER,
};
const MANAGER: TeamMember = {
  userId: "user_manager",
  name: null,
  email: "bob@example.com",
  imageUrl: null,
  role: Role.MANAGER,
};
const VIEWER: TeamMember = {
  userId: "user_viewer",
  name: "Carol Viewer",
  email: "carol@example.com",
  imageUrl: null,
  role: Role.VIEWER,
};
const MEMBERS = [OWNER, MANAGER, VIEWER];

const ACTIVITY_EVENTS = [
  {
    id: "event_1",
    action: AuditAction.VEHICLE_UPDATED,
    entityType: AuditEntityType.VEHICLE,
    entityId: "vehicle_1",
    metadata: {
      changes: [
        { field: "parkingType", from: "CUSTOMER_SITE", to: "DEPOT" },
        { field: "averageDailyDistanceKm", from: 180, to: 220 },
      ],
    },
    createdAt: "2026-10-04T09:42:00.000Z",
    actorUser: { id: OWNER.userId, email: OWNER.email, name: OWNER.name },
    subjectName: "Scania R450",
  },
  {
    id: "event_2",
    action: AuditAction.MEMBERSHIP_ROLE_UPDATED,
    entityType: AuditEntityType.MEMBERSHIP,
    entityId: "membership_1",
    metadata: { userId: VIEWER.userId, role: "VIEWER" },
    createdAt: "2026-10-03T09:42:00.000Z",
    actorUser: { id: OWNER.userId, email: OWNER.email, name: OWNER.name },
    subjectName: "Carol Viewer",
  },
];

interface RenderOptions {
  canManageTeam: boolean;
  canSeeActivity: boolean;
  currentUserId?: string;
}

function renderView({
  canManageTeam,
  canSeeActivity,
  currentUserId = OWNER.userId,
}: RenderOptions) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <NextIntlClientProvider
        locale="en"
        timeZone={DISPLAY_TIME_ZONE}
        messages={englishMessages}
      >
        <TeamAndActivityView
          fleetId="fleet_1"
          members={MEMBERS}
          currentUserId={currentUserId}
          canManageTeam={canManageTeam}
          canSeeActivity={canSeeActivity}
        />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  refreshMock.mockClear();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      events: ACTIVITY_EVENTS,
      totalCount: ACTIVITY_EVENTS.length,
      page: 1,
      pageSize: 20,
    }),
  });
});

describe("what a viewer can do on the team page", () => {
  it("sees the team but no invite button and no role menus", () => {
    renderView({
      canManageTeam: false,
      canSeeActivity: false,
      currentUserId: VIEWER.userId,
    });

    expect(screen.getByText("Carol Viewer (You)")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: teamMessages.invite }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Options for/)).not.toBeInTheDocument();
  });

  it("does not show the activity or the tabs", () => {
    renderView({ canManageTeam: false, canSeeActivity: false });

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(
      screen.queryByText(auditMessages.activityTitle),
    ).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("what an owner can do on the team page", () => {
  beforeEach(() => {
    renderView({ canManageTeam: true, canSeeActivity: true });
  });

  it("sees the invite button", () => {
    expect(
      screen.getByRole("button", { name: teamMessages.invite }),
    ).toBeInTheDocument();
  });

  it("gets a role menu for every member except themselves", () => {
    expect(
      screen.getByLabelText("Options for bob@example.com"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Options for Carol Viewer"),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Options for Alice Owner"),
    ).not.toBeInTheDocument();
  });

  it("opens the invite form and sends the invitation", async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: teamMessages.invite }));
    await user.type(
      screen.getByLabelText(teamMessages.inviteEmail),
      "dana@example.com",
    );
    await user.click(
      screen.getByRole("button", { name: teamMessages.inviteSubmit }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/fleets/fleet_1/members",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "dana@example.com", role: "VIEWER" }),
      }),
    );
  });
});

describe("what a manager sees on the team page", () => {
  it("sees the activity but cannot invite", async () => {
    renderView({
      canManageTeam: false,
      canSeeActivity: true,
      currentUserId: MANAGER.userId,
    });

    expect(
      await screen.findByText(
        "Alice Owner changed the role of Carol Viewer to Viewer",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: teamMessages.invite }),
    ).not.toBeInTheDocument();
  });
});

describe("the Activity and Team tabs", () => {
  beforeEach(() => {
    renderView({ canManageTeam: true, canSeeActivity: true });
  });

  it("are real tabs, with Activity selected first", () => {
    const tabs = screen.getAllByRole("tab");

    expect(tabs.map((tab) => tab.textContent)).toEqual([
      auditMessages.tabActivity,
      auditMessages.tabTeam,
    ]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  it("switch with the arrow keys and show the matching panel", async () => {
    const user = userEvent.setup();
    const activityPanel = screen.getByRole("tabpanel", {
      name: auditMessages.tabActivity,
    });
    const teamPanel = screen.getByRole("tabpanel", {
      name: auditMessages.tabTeam,
      hidden: true,
    });

    expect(teamPanel).toHaveClass("hidden");

    await user.click(screen.getAllByRole("tab")[0]);
    await user.keyboard("{ArrowRight}");

    expect(screen.getAllByRole("tab")[1]).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(teamPanel).not.toHaveClass("hidden");
    expect(activityPanel).toHaveClass("hidden");
  });
});

describe("the activity list", () => {
  it("describes changes in sentences, never with raw enum names", async () => {
    const { container } = renderView({
      canManageTeam: true,
      canSeeActivity: true,
    });

    expect(
      await screen.findByText(
        "Alice Owner changed daily distance for Scania R450 from 180 km to 220 km",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Alice Owner changed parking place for Scania R450 from At customer sites to At our depot",
      ),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(RAW_ENUM_NAME_PATTERN);
  });

  it("asks for the chosen kind of events", async () => {
    const user = userEvent.setup();
    renderView({ canManageTeam: true, canSeeActivity: true });
    await screen.findAllByText(/Scania R450/);

    await user.click(
      within(
        screen.getByRole("radiogroup", { name: auditMessages.filters.label }),
      ).getByLabelText(auditMessages.filters.team),
    );

    await screen.findByText(/Carol Viewer to Viewer/);
    const lastRequestedUrl = (global.fetch as jest.Mock).mock.calls.at(-1)[0];
    expect(lastRequestedUrl).toContain("entityType=MEMBERSHIP");
    expect(lastRequestedUrl).toContain("entityType=INVITATION");
  });
});
