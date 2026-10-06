import { useTranslations } from "next-intl";
import {
  vehicleDisplayName,
  type NamedVehicle,
} from "@/lib/vehicle-display-name";

export function useVehicleDisplayName() {
  const tVehicleType = useTranslations("calculator.options.vehicleType");

  return (vehicle: NamedVehicle) =>
    vehicleDisplayName(vehicle, tVehicleType(vehicle.vehicleType));
}
