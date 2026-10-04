import { z } from "zod";
import {
  CargoType,
  ParkingType,
  SolarPanelPlacement,
  VehicleType,
} from "@/app/generated/prisma/enums";
import { EU_COUNTRY_CODES } from "@/lib/assumptions/eu-countries";
import {
  COOLING_UNIT_TYPES,
  DISTANCE_BANDS,
  IDLING_FREQUENCIES,
} from "@/lib/assumptions/types";

const MAX_QUICK_CHECK_QUANTITY = 999;
const MAX_CITY_LABEL_LENGTH = 120;

export const quickCheckSchema = z.object({
  vehicleType: z.enum(Object.values(VehicleType)),
  quantity: z.number().int().min(1).max(MAX_QUICK_CHECK_QUANTITY),
  cargoType: z.enum(Object.values(CargoType)),
  distanceBand: z.enum(DISTANCE_BANDS),
  idlingFrequency: z.enum(IDLING_FREQUENCIES),
  cityLabel: z.string().trim().min(1).max(MAX_CITY_LABEL_LENGTH),
  countryCode: z.enum(EU_COUNTRY_CODES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  parkingType: z.enum(Object.values(ParkingType)),
  solarPanelPlacement: z.enum(Object.values(SolarPanelPlacement)),
  averageDailyDistanceKm: z.number().positive().optional(),
  idleHoursPerDay: z.number().min(0).max(24).optional(),
  energyConsumptionKwhPer100km: z.number().positive().optional(),
  solarPanelCapacityKw: z.number().nonnegative().optional(),
  payloadReserveKg: z.number().nonnegative().optional(),
  maxRoofLoadKg: z.number().nonnegative().optional(),
  operatingMonthsPerYear: z.number().int().min(1).max(12).optional(),
  coolingUnitType: z.enum(COOLING_UNIT_TYPES).optional(),
});

export type QuickCheckAnswers = z.infer<typeof quickCheckSchema>;
