import { notFound, redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import Heading from "@/components/common/Heading";
import TeamAndActivityView from "@/components/team/TeamAndActivityView";
import { prisma } from "@/lib/prisma";
import {
  ANY_FLEET_ROLE,
  FLEET_EDITOR_ROLES,
  FLEET_OWNER_ONLY,
  ForbiddenError,
  requireFleetRole,
} from "@/lib/fleet-auth";
import { findFleetBySlug } from "@/lib/fleet-repo";
import { loginPath } from "@/lib/public-paths";
import { getTranslations } from "next-intl/server";

async function findMemberAccess(session: Session, fleetId: string) {
  try {
    return await requireFleetRole(session, fleetId, ANY_FLEET_ROLE);
  } catch (error) {
    if (error instanceof ForbiddenError) return null;
    throw error;
  }
}

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

  const fleet = await findFleetBySlug(fleetSlug);
  const access = fleet ? await findMemberAccess(session, fleet.id) : null;

  if (!fleet || !access) {
    notFound();
  }

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
