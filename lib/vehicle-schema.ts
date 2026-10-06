import { z } from "zod";
import {
  VehicleType,
  EngineType,
  ParkingType,
  SolarPanelPlacement,
  CargoType,
  CoolingUnitType,
} from "@/app/generated/prisma/enums";

export const vehicleInputSchema = z.object({
  name: z.string().trim().min(1).max(80).nullable().optional(),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  vehicleType: z.enum(Object.values(VehicleType)),
  engineType: z.enum(Object.values(EngineType)),
  parkingType: z.enum(Object.values(ParkingType)),
  quantity: z.number().int().positive(),
  averageDailyDistanceKm: z.number().positive(),
  energyConsumptionKwhPer100km: z.number().nonnegative(),
  solarPanelCapacityKw: z.number().nonnegative(),
  solarPanelPlacement: z.enum(Object.values(SolarPanelPlacement)),
  payloadReserveKg: z.number().nonnegative(),
  maxRoofLoadKg: z.number().nonnegative(),
  operatingMonthsPerYear: z.number().int().min(1).max(12),
  winterUsage: z.boolean(),
  city: z.string().min(1),
  country: z.string().min(1),
  cargoType: z.enum(Object.values(CargoType)).optional(),
  coolingUnitType: z.enum(Object.values(CoolingUnitType)).nullable().optional(),
  idleHoursPerDay: z.number().min(0).max(24).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const vehicleUpdateSchema = vehicleInputSchema.partial();
