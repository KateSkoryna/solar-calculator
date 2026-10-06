import type { VehicleType } from "@/app/generated/prisma/enums";
import { QUICK_CHECK_VEHICLE_MANUFACTURER } from "@/lib/quick-check-mapping";

export interface NamedVehicle {
  name: string | null;
  manufacturer: string;
  model: string;
  city: string;
  quantity: number;
  vehicleType: VehicleType;
}

export function shortCityName(city: string) {
  return city.split(",")[0].trim();
}

export function vehicleDisplayName(
  { name, manufacturer, model, city, quantity }: NamedVehicle,
  vehicleTypeLabel: string,
) {
  if (name) return name;
  if (manufacturer === QUICK_CHECK_VEHICLE_MANUFACTURER) {
    return `${shortCityName(city)} ${quantity} ${vehicleTypeLabel}`;
  }
  return `${manufacturer} ${model}`;
}
