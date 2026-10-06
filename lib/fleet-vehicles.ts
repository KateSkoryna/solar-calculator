import type { NamedVehicle } from "@/lib/vehicle-display-name";
import { prisma } from "@/lib/prisma";

export interface FleetVehicleRow extends NamedVehicle {
  id: string;
  quantity: number;
}

export function loadFleetVehicles(fleetId: string): Promise<FleetVehicleRow[]> {
  return prisma.vehicle.findMany({
    where: { fleetId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      manufacturer: true,
      model: true,
      vehicleType: true,
      city: true,
      quantity: true,
    },
  });
}
