import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import CalculatorWizard from "@/components/calculator/CalculatorWizard";
import { FLEET_EDITOR_ROLES } from "@/lib/fleet-auth";
import { loadFleetPageAccess } from "@/lib/fleet-page-access";
import { loginPath } from "@/lib/public-paths";

export default async function NewVehiclePage({
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

  if (!pageAccess || !FLEET_EDITOR_ROLES.includes(pageAccess.access.role)) {
    notFound();
  }

  return (
    <CalculatorWizard fleet={{ id: pageAccess.fleet.id, slug: fleetSlug }} />
  );
}
