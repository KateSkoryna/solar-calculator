import type { ComponentType, SVGProps } from "react";
import { LuBus, LuTruck } from "react-icons/lu";
import type { VehicleType } from "@/app/generated/prisma/enums";
import TrailerIcon from "@/components/icons/TrailerIcon";
import VanIcon from "@/components/icons/VanIcon";

export type VehicleIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const VEHICLE_ICONS: Record<VehicleType, VehicleIconComponent> = {
  VAN: VanIcon,
  TRUCK: LuTruck,
  BUS: LuBus,
  TRAILER: TrailerIcon,
};
