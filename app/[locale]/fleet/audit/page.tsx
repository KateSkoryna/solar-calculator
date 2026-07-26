import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  requireFleetRole,
  FLEET_EDITOR_ROLES,
  ForbiddenError,
} from "@/lib/fleet-auth";
import { AuditEntityType } from "@/lib/audit";
import Section from "@/components/layout/Section";
import PageTitle from "@/components/common/PageTitle";
import AuditLogView from "@/components/audit/AuditLogView";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ fleetId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const memberships = await prisma.fleetMembership.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) {
    return (
      <Section>
        <PageTitle>Audit Log</PageTitle>
        <p className="text-center text-[var(--text-body)]">
          You are not a member of any fleet yet.
        </p>
      </Section>
    );
  }

  const { fleetId: requestedFleetId } = await searchParams;
  const fleetId = requestedFleetId || memberships[0].fleetId;

  try {
    await requireFleetRole(session, fleetId, FLEET_EDITOR_ROLES);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <Section>
          <PageTitle>Audit Log</PageTitle>
          <p className="text-center text-red-500">{error.message}</p>
        </Section>
      );
    }
    throw error;
  }

  const fleetMembers = await prisma.fleetMembership.findMany({
    where: { fleetId },
    select: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <Section>
      <PageTitle>Audit Log</PageTitle>
      <AuditLogView
        fleetId={fleetId}
        actors={fleetMembers.map((membership) => ({
          id: membership.user.id,
          email: membership.user.email,
        }))}
        entityTypes={Object.values(AuditEntityType)}
      />
    </Section>
  );
}
