import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import PageContainer from "@/components/layout/PageContainer";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
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

  return (
    <>
      <Header />
      <PageContainer className="flex flex-1 flex-col">
        <WorkspaceTopBar
          fleets={workspace.fleets}
          currentFleetSlug={fleetSlug}
        />
        <div className="flex flex-1 gap-6 py-6 md:py-10 lg:gap-8">
          <WorkspaceSidebar
            fleets={workspace.fleets}
            currentFleetSlug={fleetSlug}
          />
          <WorkspaceIconRail currentFleetSlug={fleetSlug} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </PageContainer>
      <div className="pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">
        <Footer />
      </div>
      <WorkspaceTabBar currentFleetSlug={fleetSlug} />
    </>
  );
}
