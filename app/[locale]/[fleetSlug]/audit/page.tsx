import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  requireFleetRole,
  FLEET_EDITOR_ROLES,
  ForbiddenError,
} from "@/lib/fleet-auth";
import { findFleetBySlug } from "@/lib/fleet-repo";
import { AuditEntityType } from "@/lib/audit";
import Section from "@/components/layout/Section";
import PageTitle from "@/components/common/PageTitle";
import AuditLogView from "@/components/audit/AuditLogView";

function NotFoundMessage({ title, text }: { title: string; text: string }) {
  return (
    <Section>
      <PageTitle>{title}</PageTitle>
      <p className="text-center text-[var(--text-body)]">{text}</p>
    </Section>
  );
}

export default async function AuditLogPage({
  params,
}: {
  params: Promise<{ fleetSlug: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const t = await getTranslations("audit");
  const { fleetSlug } = await params;
  const fleet = await findFleetBySlug(fleetSlug);

  if (!fleet) {
    return <NotFoundMessage title={t("title")} text={t("notFound")} />;
  }

  try {
    await requireFleetRole(session, fleet.id, FLEET_EDITOR_ROLES);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return <NotFoundMessage title={t("title")} text={t("notFound")} />;
    }
    throw error;
  }

  const fleetMembers = await prisma.fleetMembership.findMany({
    where: { fleetId: fleet.id },
    select: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <Section>
      <PageTitle>{t("title")}</PageTitle>
      <AuditLogView
        fleetId={fleet.id}
        users={fleetMembers.map((membership) => ({
          id: membership.user.id,
          email: membership.user.email,
        }))}
        entityTypes={Object.values(AuditEntityType)}
      />
    </Section>
  );
}
