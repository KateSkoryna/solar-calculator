import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import Heading from "@/components/common/Heading";
import AddVehiclesLink from "@/components/fleet/AddVehiclesLink";
import FleetEmptyState from "@/components/fleet/FleetEmptyState";
import VehicleList from "@/components/fleet/VehicleList";
import { FLEET_EDITOR_ROLES } from "@/lib/fleet-auth";
import { loadFleetPageAccess } from "@/lib/fleet-page-access";
import { loadFleetVehicles } from "@/lib/fleet-vehicles";
import { calculatorPath, loginPath } from "@/lib/public-paths";

export default async function FleetVehiclesPage({
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

  const canEdit = FLEET_EDITOR_ROLES.includes(pageAccess.access.role);
  const t = await getTranslations("vehicles");
  const vehicles = await loadFleetVehicles(pageAccess.fleet.id);
  const addVehiclesPath = calculatorPath(locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading level={1} size="display-s">
          {t("title")}
        </Heading>
        {canEdit && vehicles.length > 0 && (
          <AddVehiclesLink href={addVehiclesPath} />
        )}
      </div>

      {vehicles.length === 0 ? (
        <FleetEmptyState
          canAddVehicles={canEdit}
          addVehiclesPath={addVehiclesPath}
        />
      ) : (
        <VehicleList
          vehicles={vehicles}
          fleetSlug={fleetSlug}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
