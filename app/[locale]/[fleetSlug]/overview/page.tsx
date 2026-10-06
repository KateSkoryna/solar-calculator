import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import Heading from "@/components/common/Heading";
import AddVehiclesLink from "@/components/fleet/AddVehiclesLink";
import FleetEmptyState from "@/components/fleet/FleetEmptyState";
import FleetKpiRow from "@/components/fleet/FleetKpiRow";
import VehicleGroupList from "@/components/fleet/VehicleGroupList";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import {
  aggregateFleetKpis,
  loadFleetDashboardData,
} from "@/lib/fleet-dashboard";
import { FLEET_EDITOR_ROLES } from "@/lib/fleet-auth";
import { loadFleetPageAccess } from "@/lib/fleet-page-access";
import { calculatorPath, loginPath } from "@/lib/public-paths";
import { workspaceNavItemPath } from "@/lib/workspace-nav";

export default async function FleetOverviewPage({
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
  const canAddVehicles = FLEET_EDITOR_ROLES.includes(access.role);
  const t = await getTranslations("overview");
  const currentAssumptionSetVersion = ASSUMPTION_SET_V1.version;
  const groups = await loadFleetDashboardData(fleet.id);
  const vehiclesPath = workspaceNavItemPath(locale, fleetSlug, "vehicles");
  const addVehiclesPath = calculatorPath(locale);
  const vehicleCount = groups.reduce(
    (total, { quantity }) => total + quantity,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading level={1} size="display-s">
          {t("title")}
        </Heading>
        {canAddVehicles && groups.length > 0 && (
          <AddVehiclesLink href={addVehiclesPath} />
        )}
      </div>

      {groups.length === 0 ? (
        <FleetEmptyState
          canAddVehicles={canAddVehicles}
          addVehiclesPath={addVehiclesPath}
        />
      ) : (
        <>
          <FleetKpiRow
            kpis={aggregateFleetKpis(groups, currentAssumptionSetVersion)}
            vehicleCount={vehicleCount}
            groupCount={groups.length}
          />
          <VehicleGroupList
            groups={groups}
            currentAssumptionSetVersion={currentAssumptionSetVersion}
            fleetPath={`/${locale}/${fleetSlug}`}
            vehiclesPath={vehiclesPath}
          />
        </>
      )}
    </div>
  );
}
