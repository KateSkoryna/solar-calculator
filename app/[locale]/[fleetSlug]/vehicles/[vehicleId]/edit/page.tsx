import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import VehicleEditForm from "@/components/fleet/VehicleEditForm";
import { FLEET_EDITOR_ROLES } from "@/lib/fleet-auth";
import { loadFleetPageAccess } from "@/lib/fleet-page-access";
import { loginPath } from "@/lib/public-paths";
import { NO_COOLING_UNIT } from "@/lib/vehicle-edit-form";
import { findActiveVehicle } from "@/lib/vehicle-repo";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ locale: string; fleetSlug: string; vehicleId: string }>;
}) {
  const { locale, fleetSlug, vehicleId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(loginPath(locale));
  }

  const pageAccess = await loadFleetPageAccess(session, fleetSlug);

  if (!pageAccess || !FLEET_EDITOR_ROLES.includes(pageAccess.access.role)) {
    notFound();
  }

  const vehicle = await findActiveVehicle(pageAccess.fleet.id, vehicleId);

  if (!vehicle) {
    notFound();
  }

  return (
    <VehicleEditForm
      fleetId={pageAccess.fleet.id}
      fleetSlug={fleetSlug}
      vehicleId={vehicle.id}
      vehicleName={`${vehicle.manufacturer} ${vehicle.model}`}
      initialValues={{
        manufacturer: vehicle.manufacturer,
        model: vehicle.model,
        vehicleType: vehicle.vehicleType,
        engineType: vehicle.engineType,
        parkingType: vehicle.parkingType,
        quantity: vehicle.quantity,
        averageDailyDistanceKm: vehicle.averageDailyDistanceKm,
        energyConsumptionKwhPer100km: vehicle.energyConsumptionKwhPer100km,
        solarPanelCapacityKw: vehicle.solarPanelCapacityKw,
        solarPanelPlacement: vehicle.solarPanelPlacement,
        payloadReserveKg: vehicle.payloadReserveKg,
        maxRoofLoadKg: vehicle.maxRoofLoadKg,
        operatingMonthsPerYear: vehicle.operatingMonthsPerYear,
        winterUsage: vehicle.winterUsage,
        city: vehicle.city,
        country: vehicle.country,
        cargoType: vehicle.cargoType,
        idleHoursPerDay: vehicle.idleHoursPerDay,
        coolingUnitType: vehicle.coolingUnitType ?? NO_COOLING_UNIT,
      }}
    />
  );
}
