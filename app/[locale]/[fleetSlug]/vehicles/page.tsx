import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import Heading from "@/components/common/Heading";
import AddVehiclesLink from "@/components/fleet/AddVehiclesLink";
import FleetEmptyState from "@/components/fleet/FleetEmptyState";
import VehicleGroupList from "@/components/fleet/VehicleGroupList";
import VehicleRowActions from "@/components/fleet/VehicleRowActions";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { FLEET_EDITOR_ROLES, FLEET_OWNER_ONLY } from "@/lib/fleet-auth";
import { loadFleetDashboardData } from "@/lib/fleet-dashboard";
import { loadFleetPageAccess } from "@/lib/fleet-page-access";
import { loginPath } from "@/lib/public-paths";
import { fleetNewVehiclePath, fleetVehiclesPath } from "@/lib/workspace-path";

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

  const { fleet, access } = pageAccess;
  const canEdit = FLEET_EDITOR_ROLES.includes(access.role);
  const canDelete = FLEET_OWNER_ONLY.includes(access.role);
  const t = await getTranslations("vehicles");
  const groups = await loadFleetDashboardData(fleet.id);
  const newVehiclePath = fleetNewVehiclePath(locale, fleetSlug);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading level={1} size="display-s">
          {t("title")}
        </Heading>
        {canEdit && groups.length > 0 && (
          <AddVehiclesLink href={newVehiclePath} />
        )}
      </div>

      {groups.length === 0 ? (
        <FleetEmptyState
          canAddVehicles={canEdit}
          newVehiclePath={newVehiclePath}
        />
      ) : (
        <VehicleGroupList
          groups={groups}
          currentAssumptionSetVersion={ASSUMPTION_SET_V1.version}
          fleetPath={`/${locale}/${fleetSlug}`}
          vehiclesPath={fleetVehiclesPath(locale, fleetSlug)}
          renderActions={
            canEdit || canDelete
              ? (group) => (
                  <VehicleRowActions
                    group={group}
                    fleetId={fleet.id}
                    fleetSlug={fleetSlug}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                )
              : undefined
          }
        />
      )}
    </div>
  );
}
