import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import WorkspaceIconRail from "@/components/workspace/WorkspaceIconRail";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import WorkspaceTabBar from "@/components/workspace/WorkspaceTabBar";
import WorkspaceTopBar from "@/components/workspace/WorkspaceTopBar";
import { loginPath } from "@/lib/public-paths";
import { loadWorkspaceLayout } from "@/lib/workspace-layout-loader";

export default async function FleetWorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string; fleetSlug: string }>;
}) {
  const { locale, fleetSlug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(loginPath(locale));
  }

  const workspace = await loadWorkspaceLayout(session, fleetSlug);

  if (!workspace) {
    notFound();
  }

  const user = {
    name: session.user.name ?? session.user.email ?? "",
    imageUrl: session.user.image ?? null,
  };

  return (
    <div className="flex min-h-dvh">
      <WorkspaceSidebar
        fleets={workspace.fleets}
        currentFleetSlug={fleetSlug}
        user={user}
      />
      <WorkspaceIconRail currentFleetSlug={fleetSlug} />
      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceTopBar
          fleets={workspace.fleets}
          currentFleetSlug={fleetSlug}
          user={user}
        />
        <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </div>
      <WorkspaceTabBar currentFleetSlug={fleetSlug} />
    </div>
  );
}
