import type { Vehicle } from "@/app/generated/prisma/client";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate, SCENARIO_KINDS } from "@/lib/calculation-engine";
import {
  toCalculationInput,
  toInputSnapshotData,
  toResultData,
} from "@/lib/calculation-service";
import { prisma } from "@/lib/prisma";

const BERLIN_COORDINATES = { latitude: 52.52, longitude: 13.405 };
const LYON_COORDINATES = { latitude: 45.764, longitude: 4.8357 };

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
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: "user_bob" },
    update: {},
    create: {
      id: "user_bob",
      email: "bob@example.com",
      name: "Bob Manager",
    },
  });

  const carol = await prisma.user.upsert({
    where: { id: "user_carol" },
    update: {},
    create: {
      id: "user_carol",
      email: "carol@example.com",
      name: "Carol Viewer",
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
    update: BERLIN_COORDINATES,
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
      ...BERLIN_COORDINATES,
    },
  });

  const vanTwo = await prisma.vehicle.upsert({
    where: { id: "vehicle_berlin_van_2" },
    update: BERLIN_COORDINATES,
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
      ...BERLIN_COORDINATES,
    },
  });

  await seedCalculation({
    id: "calc_berlin_1",
    fleetId: fleet.id,
    vehicle: vanOne,
    requestedByUserId: alice.id,
  });

  await seedCalculation({
    id: "calc_berlin_2",
    fleetId: fleet.id,
    vehicle: vanTwo,
    requestedByUserId: bob.id,
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
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: "user_bob" },
    update: {},
    create: {
      id: "user_bob",
      email: "bob@example.com",
      name: "Bob Manager",
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
    update: LYON_COORDINATES,
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
      ...LYON_COORDINATES,
    },
  });

  const truckTwo = await prisma.vehicle.upsert({
    where: { id: "vehicle_lyon_truck_2" },
    update: LYON_COORDINATES,
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
      ...LYON_COORDINATES,
    },
  });

  await seedCalculation({
    id: "calc_lyon_1",
    fleetId: fleet.id,
    vehicle: truckOne,
    requestedByUserId: dave.id,
  });

  await seedCalculation({
    id: "calc_lyon_2",
    fleetId: fleet.id,
    vehicle: truckTwo,
    requestedByUserId: dave.id,
  });
}

async function seedCalculation(params: {
  id: string;
  fleetId: string;
  vehicle: Vehicle;
  requestedByUserId: string;
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

  const input = toCalculationInput(params.vehicle);
  const output = calculate(input, ASSUMPTION_SET_V1);

  for (const kind of SCENARIO_KINDS) {
    const scenarioId = `${params.id}_${kind.toLowerCase()}`;

    const scenarioData = {
      kind,
      label: kind,
      formulaVersion: output.formulaVersion,
      assumptionSetVersion: output.assumptionSetVersion,
    };
    const scenario = await prisma.calculationScenario.upsert({
      where: { calculationId_kind: { calculationId: calculation.id, kind } },
      update: scenarioData,
      create: {
        id: scenarioId,
        calculationId: calculation.id,
        ...scenarioData,
      },
    });

    const snapshotData = toInputSnapshotData(output, kind);
    await prisma.calculationInputSnapshot.upsert({
      where: { calculationScenarioId: scenario.id },
      update: snapshotData,
      create: {
        id: `${scenarioId}_snapshot`,
        calculationScenarioId: scenario.id,
        ...snapshotData,
      },
    });

    const resultData = toResultData(output, kind);
    await prisma.calculationResult.upsert({
      where: { calculationScenarioId: scenario.id },
      update: resultData,
      create: {
        id: `${scenarioId}_result`,
        calculationScenarioId: scenario.id,
        ...resultData,
      },
    });
  }
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
