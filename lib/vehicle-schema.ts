import { z } from "zod";
import {
  VehicleType,
  EngineType,
  ParkingType,
  SolarPanelPlacement,
} from "@/app/generated/prisma/enums";

export const vehicleInputSchema = z.object({
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  vehicleType: z.enum(Object.values(VehicleType)),
  engineType: z.enum(Object.values(EngineType)),
  parkingType: z.enum(Object.values(ParkingType)),
  quantity: z.number().int().positive(),
  averageDailyDistanceKm: z.number().positive(),
  energyConsumptionKwhPer100km: z.number().positive(),
  solarPanelCapacityKw: z.number().nonnegative(),
  solarPanelPlacement: z.enum(Object.values(SolarPanelPlacement)),
  payloadReserveKg: z.number().nonnegative(),
  maxRoofLoadKg: z.number().nonnegative(),
  operatingMonthsPerYear: z.number().int().min(1).max(12),
  winterUsage: z.boolean(),
  city: z.string().min(1),
  country: z.string().min(1),
});

export const vehicleUpdateSchema = vehicleInputSchema.partial();
