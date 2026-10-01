import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { onboardingPath } from "@/lib/workspace-path";

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
    select: { fleet: { select: { slug: true } } },
  });

  if (!firstMembership) {
    redirect(onboardingPath(locale));
  }

  redirect(`/${locale}/${firstMembership.fleet.slug}`);
}
