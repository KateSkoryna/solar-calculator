import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import Heading from "@/components/common/Heading";
import TeamAndActivityView from "@/components/team/TeamAndActivityView";
import { prisma } from "@/lib/prisma";
import { FLEET_EDITOR_ROLES, FLEET_OWNER_ONLY } from "@/lib/fleet-auth";
import { loadFleetPageAccess } from "@/lib/fleet-page-access";
import { loginPath } from "@/lib/public-paths";
import { getTranslations } from "next-intl/server";

export default async function TeamAndActivityPage({
  params,
}: {
  params: Promise<{ locale: string; fleetSlug: string }>;
}) {
  const { locale, fleetSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(loginPath(locale));
  }

  const pageAccess = await loadFleetPageAccess(session, fleetSlug);

  if (!pageAccess) {
    notFound();
  }

  const { fleet, access } = pageAccess;

  const t = await getTranslations("audit");
  const memberships = await prisma.fleetMembership.findMany({
    where: { fleetId: fleet.id },
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1} size="display-s">
        {t("title")}
      </Heading>
      <TeamAndActivityView
        fleetId={fleet.id}
        currentUserId={session.user.id}
        canManageTeam={FLEET_OWNER_ONLY.includes(access.role)}
        canSeeActivity={FLEET_EDITOR_ROLES.includes(access.role)}
        members={memberships.map(({ role, user }) => ({
          userId: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.image,
          role,
        }))}
      />
    </div>
  );
}
