import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? "password123";
const SEED_PASSWORD_HASH = bcrypt.hashSync(SEED_USER_PASSWORD, 12);

async function seedBerlinDeliveryFleet() {
  const fleet = await prisma.fleet.upsert({
    where: { id: "fleet_berlin_delivery" },
    update: {},
    create: {
      id: "fleet_berlin_delivery",
      name: "Berlin Delivery Fleet",
      slug: "berlin",
      type: "VAN",
    },
  });

  const alice = await prisma.user.upsert({
    where: { id: "user_alice" },
    update: {},
    create: {
      id: "user_alice",
      email: "k.skoryna@gmail.com",
      name: "Alice Owner",
      password: SEED_PASSWORD_HASH,
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: "user_bob" },
    update: {},
    create: {
      id: "user_bob",
      email: "bob@example.com",
      name: "Bob Manager",
      password: SEED_PASSWORD_HASH,
    },
  });

  const carol = await prisma.user.upsert({
    where: { id: "user_carol" },
    update: {},
    create: {
      id: "user_carol",
      email: "carol@example.com",
      name: "Carol Viewer",
      password: SEED_PASSWORD_HASH,
    },
  });

  await prisma.fleetMembership.upsert({
    where: { fleetId_userId: { fleetId: fleet.id, userId: alice.id } },
    update: {},
    create: { fleetId: fleet.id, userId: alice.id, role: "OWNER" },
  });

  await prisma.fleetMembership.upsert({
    where: { fleetId_userId: { fleetId: fleet.id, userId: bob.id } },
    update: {},
    create: { fleetId: fleet.id, userId: bob.id, role: "MANAGER" },
  });

  await prisma.fleetMembership.upsert({
    where: { fleetId_userId: { fleetId: fleet.id, userId: carol.id } },
    update: {},
    create: { fleetId: fleet.id, userId: carol.id, role: "VIEWER" },
  });

  const vanOne = await prisma.vehicle.upsert({
    where: { id: "vehicle_berlin_van_1" },
    update: {},
    create: {
      id: "vehicle_berlin_van_1",
      fleetId: fleet.id,
      manufacturer: "Mercedes-Benz",
      model: "eSprinter",
      vehicleType: "VAN",
      engineType: "ELECTRIC",
      parkingType: "DEPOT",
      quantity: 5,
      averageDailyDistanceKm: 120,
      energyConsumptionKwhPer100km: 22,
      solarPanelCapacityKw: 1.5,
      solarPanelPlacement: "ROOF",
      payloadReserveKg: 400,
      maxRoofLoadKg: 150,
      operatingMonthsPerYear: 12,
      winterUsage: true,
      city: "Berlin",
      country: "Germany",
    },
  });

  const vanTwo = await prisma.vehicle.upsert({
    where: { id: "vehicle_berlin_van_2" },
    update: {},
    create: {
      id: "vehicle_berlin_van_2",
      fleetId: fleet.id,
      manufacturer: "Ford",
      model: "E-Transit",
      vehicleType: "VAN",
      engineType: "ELECTRIC",
      parkingType: "STREET",
      quantity: 3,
      averageDailyDistanceKm: 95,
      energyConsumptionKwhPer100km: 24,
      solarPanelCapacityKw: 1.2,
      solarPanelPlacement: "ROOF",
      payloadReserveKg: 350,
      maxRoofLoadKg: 130,
      operatingMonthsPerYear: 12,
      winterUsage: true,
      city: "Berlin",
      country: "Germany",
    },
  });

  await seedCalculation({
    id: "calc_berlin_1",
    fleetId: fleet.id,
    vehicle: vanOne,
    requestedByUserId: alice.id,
    paybackPeriodMonths: 34.5,
    totalSolarYieldKwh: 5400,
    co2SavedKg: 2100,
    netSavingsAmount: "8200.50",
  });

  await seedCalculation({
    id: "calc_berlin_2",
    fleetId: fleet.id,
    vehicle: vanTwo,
    requestedByUserId: bob.id,
    paybackPeriodMonths: 41.2,
    totalSolarYieldKwh: 3900,
    co2SavedKg: 1500,
    netSavingsAmount: "5600.00",
  });
}

async function seedLyonLogisticsFleet() {
  const fleet = await prisma.fleet.upsert({
    where: { id: "fleet_lyon_logistics" },
    update: {},
    create: {
      id: "fleet_lyon_logistics",
      name: "Lyon Logistics Fleet",
      slug: "lyon",
      type: "TRUCK",
    },
  });

  const dave = await prisma.user.upsert({
    where: { id: "user_dave" },
    update: {},
    create: {
      id: "user_dave",
      email: "dave@example.com",
      name: "Dave Owner",
      password: SEED_PASSWORD_HASH,
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: "user_bob" },
    update: {},
    create: {
      id: "user_bob",
      email: "bob@example.com",
      name: "Bob Manager",
      password: SEED_PASSWORD_HASH,
    },
  });

  await prisma.fleetMembership.upsert({
    where: { fleetId_userId: { fleetId: fleet.id, userId: dave.id } },
    update: {},
    create: { fleetId: fleet.id, userId: dave.id, role: "OWNER" },
  });

  await prisma.fleetMembership.upsert({
    where: { fleetId_userId: { fleetId: fleet.id, userId: bob.id } },
    update: {},
    create: { fleetId: fleet.id, userId: bob.id, role: "VIEWER" },
  });

  const truckOne = await prisma.vehicle.upsert({
    where: { id: "vehicle_lyon_truck_1" },
    update: {},
    create: {
      id: "vehicle_lyon_truck_1",
      fleetId: fleet.id,
      manufacturer: "Volvo",
      model: "FH Electric",
      vehicleType: "TRUCK",
      engineType: "ELECTRIC",
      parkingType: "DEPOT",
      quantity: 8,
      averageDailyDistanceKm: 250,
      energyConsumptionKwhPer100km: 110,
      solarPanelCapacityKw: 4,
      solarPanelPlacement: "ALL_OVER",
      payloadReserveKg: 2000,
      maxRoofLoadKg: 600,
      operatingMonthsPerYear: 12,
      winterUsage: false,
      city: "Lyon",
      country: "France",
    },
  });

  const truckTwo = await prisma.vehicle.upsert({
    where: { id: "vehicle_lyon_truck_2" },
    update: {},
    create: {
      id: "vehicle_lyon_truck_2",
      fleetId: fleet.id,
      manufacturer: "Renault",
      model: "E-Tech D",
      vehicleType: "TRUCK",
      engineType: "ELECTRIC",
      parkingType: "CUSTOMER_SITE",
      quantity: 4,
      averageDailyDistanceKm: 180,
      energyConsumptionKwhPer100km: 95,
      solarPanelCapacityKw: 3,
      solarPanelPlacement: "SIDES",
      payloadReserveKg: 1500,
      maxRoofLoadKg: 500,
      operatingMonthsPerYear: 10,
      winterUsage: true,
      city: "Lyon",
      country: "France",
    },
  });

  await seedCalculation({
    id: "calc_lyon_1",
    fleetId: fleet.id,
    vehicle: truckOne,
    requestedByUserId: dave.id,
    paybackPeriodMonths: 28.7,
    totalSolarYieldKwh: 12800,
    co2SavedKg: 6400,
    netSavingsAmount: "21500.75",
  });

  await seedCalculation({
    id: "calc_lyon_2",
    fleetId: fleet.id,
    vehicle: truckTwo,
    requestedByUserId: dave.id,
    paybackPeriodMonths: 33.1,
    totalSolarYieldKwh: 9100,
    co2SavedKg: 4200,
    netSavingsAmount: "14300.20",
  });
}

type VehicleForSnapshot = {
  manufacturer: string;
  model: string;
  vehicleType: string;
  engineType: string;
  parkingType: string;
  quantity: number;
  averageDailyDistanceKm: number;
  energyConsumptionKwhPer100km: number;
  solarPanelCapacityKw: number;
  solarPanelPlacement: string;
  payloadReserveKg: number;
  maxRoofLoadKg: number;
  operatingMonthsPerYear: number;
  winterUsage: boolean;
  city: string;
  country: string;
};

async function seedCalculation(params: {
  id: string;
  fleetId: string;
  vehicle: VehicleForSnapshot & { id: string };
  requestedByUserId: string;
  paybackPeriodMonths: number;
  totalSolarYieldKwh: number;
  co2SavedKg: number;
  netSavingsAmount: string;
}) {
  const calculation = await prisma.calculation.upsert({
    where: { id: params.id },
    update: {},
    create: {
      id: params.id,
      fleetId: params.fleetId,
      vehicleId: params.vehicle.id,
      requestedByUserId: params.requestedByUserId,
      notes: "Seed fixture calculation",
    },
  });

  const scenario = await prisma.calculationScenario.upsert({
    where: { calculationId: calculation.id },
    update: {},
    create: {
      id: `${params.id}_scenario`,
      calculationId: calculation.id,
      label: "Base case",
      formulaVersion: "v1.0.0",
      assumptionSetVersion: "assumptions-2026-01",
    },
  });

  const vehicleSpec: VehicleForSnapshot = {
    manufacturer: params.vehicle.manufacturer,
    model: params.vehicle.model,
    vehicleType: params.vehicle.vehicleType,
    engineType: params.vehicle.engineType,
    parkingType: params.vehicle.parkingType,
    quantity: params.vehicle.quantity,
    averageDailyDistanceKm: params.vehicle.averageDailyDistanceKm,
    energyConsumptionKwhPer100km: params.vehicle.energyConsumptionKwhPer100km,
    solarPanelCapacityKw: params.vehicle.solarPanelCapacityKw,
    solarPanelPlacement: params.vehicle.solarPanelPlacement,
    payloadReserveKg: params.vehicle.payloadReserveKg,
    maxRoofLoadKg: params.vehicle.maxRoofLoadKg,
    operatingMonthsPerYear: params.vehicle.operatingMonthsPerYear,
    winterUsage: params.vehicle.winterUsage,
    city: params.vehicle.city,
    country: params.vehicle.country,
  };

  await prisma.calculationInputSnapshot.upsert({
    where: { calculationScenarioId: scenario.id },
    update: {},
    create: {
      id: `${params.id}_snapshot`,
      calculationScenarioId: scenario.id,
      vehicleSpec,
      energyPriceAssumptionVersion: "energy-price-eu-2026-01",
      emissionsFactorVersion: "emissions-eu-2026",
      solarYieldAssumptionVersion: "solar-yield-model-v2",
      currencyConversionSourceVersion: "ecb-2026-01",
    },
  });

  await prisma.calculationResult.upsert({
    where: { calculationScenarioId: scenario.id },
    update: {},
    create: {
      id: `${params.id}_result`,
      calculationScenarioId: scenario.id,
      paybackPeriodMonths: params.paybackPeriodMonths,
      totalSolarYieldKwh: params.totalSolarYieldKwh,
      co2SavedKg: params.co2SavedKg,
      netSavingsAmount: params.netSavingsAmount,
      currency: "EUR",
    },
  });
}

async function main() {
  await seedBerlinDeliveryFleet();
  await seedLyonLogisticsFleet();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
