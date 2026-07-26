import { prisma } from "@/lib/prisma";

export function findActiveVehicle(fleetId: string, vehicleId: string) {
  return prisma.vehicle.findUnique({
    where: { id_fleetId: { id: vehicleId, fleetId }, deletedAt: null },
  });
}
