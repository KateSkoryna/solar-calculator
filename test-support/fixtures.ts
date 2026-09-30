import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";

export const RIVAL_FLEET_VEHICLE_MANUFACTURER = "Rival Motors";

export const validVehicleInput = {
  manufacturer: "Ford",
  model: "E-Transit",
  vehicleType: "VAN",
  engineType: "ELECTRIC",
  parkingType: "DEPOT",
  quantity: 2,
  averageDailyDistanceKm: 100,
  energyConsumptionKwhPer100km: 20,
  solarPanelCapacityKw: 1,
  solarPanelPlacement: "ROOF",
  payloadReserveKg: 300,
  maxRoofLoadKg: 100,
  operatingMonthsPerYear: 12,
  winterUsage: true,
  city: "Berlin",
  country: "Germany",
} as const;

async function createFleet(name: string, slug: string) {
  return prisma.fleet.create({ data: { name, slug, type: "VAN" } });
}

async function createMember(fleetId: string, role: Role, label: string) {
  const user = await prisma.user.create({
    data: { email: `${label}@example.com` },
  });
  await prisma.fleetMembership.create({
    data: { fleetId, userId: user.id, role },
  });
  return user;
}

function createVehicle(fleetId: string, manufacturer: string, city: string) {
  return prisma.vehicle.create({
    data: { ...validVehicleInput, fleetId, manufacturer, city },
  });
}

export async function resetDatabase() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  const quotedTableNames = tables
    .map(({ tablename }) => `"${tablename}"`)
    .join(", ");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${quotedTableNames} RESTART IDENTITY CASCADE`,
  );
}

export async function seedFleetFixtures() {
  const fleetA = await createFleet("Fleet A", "fleet-a");
  const fleetB = await createFleet("Fleet B", "fleet-b");

  const ownerA = await createMember(fleetA.id, Role.OWNER, "owner-a");
  const managerA = await createMember(fleetA.id, Role.MANAGER, "manager-a");
  const viewerA = await createMember(fleetA.id, Role.VIEWER, "viewer-a");
  const ownerB = await createMember(fleetB.id, Role.OWNER, "owner-b");

  const vehicleA = await createVehicle(fleetA.id, "Ford", "Berlin");
  const vehicleB = await createVehicle(
    fleetB.id,
    RIVAL_FLEET_VEHICLE_MANUFACTURER,
    "Hamburg",
  );

  return {
    fleetA,
    fleetB,
    ownerA,
    managerA,
    viewerA,
    ownerB,
    vehicleA,
    vehicleB,
  };
}

export type FleetFixtures = Awaited<ReturnType<typeof seedFleetFixtures>>;
