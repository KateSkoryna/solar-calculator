import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PENDING_QUICK_CHECK_COOKIE_NAME } from "@/lib/pending-quick-check";
import { prisma } from "@/lib/prisma";
import { fleetOverviewPath, onboardingPath } from "@/lib/workspace-path";
import PendingQuickCheckRedirect from "@/components/workspace/PendingQuickCheckRedirect";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const firstMembership = await prisma.fleetMembership.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { fleet: { select: { id: true, slug: true } } },
  });

  if (!firstMembership) {
    redirect(onboardingPath(locale));
  }

  const overviewPath = fleetOverviewPath(locale, firstMembership.fleet.slug);
  const hasPendingQuickCheck = (await cookies()).has(
    PENDING_QUICK_CHECK_COOKIE_NAME,
  );

  if (!hasPendingQuickCheck) {
    redirect(overviewPath);
  }

  return (
    <PendingQuickCheckRedirect
      fleetId={firstMembership.fleet.id}
      fleetPath={`/${locale}/${firstMembership.fleet.slug}`}
      overviewPath={overviewPath}
    />
  );
}
