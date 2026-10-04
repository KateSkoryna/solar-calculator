import { useTranslations } from "next-intl";
import type {
  ParkingType,
  SolarPanelPlacement,
  VehicleType,
} from "@/app/generated/prisma/enums";
import type { CalculatorStep } from "@/components/calculator/StepIndicator";
import { VEHICLE_ICONS } from "@/components/icons/vehicle-icons";
import type { ChoiceOption } from "@/lib/choice-option";

const VEHICLE_TYPE_ORDER: VehicleType[] = ["VAN", "TRUCK", "BUS", "TRAILER"];

const PARKING_TYPE_ORDER: ParkingType[] = [
  "DEPOT",
  "STREET",
  "CUSTOMER_SITE",
  "MIXED",
];

const PANEL_PLACEMENT_SUN_RATINGS: [SolarPanelPlacement, number][] = [
  ["ROOF", 3],
  ["ALL_OVER", 3],
  ["SIDES", 2],
  ["BACK", 1],
];

const CALCULATOR_STEP_KEYS = [
  "vehicles",
  "dailyDriving",
  "location",
  "panels",
] as const;

export function useVehicleTypeOptions(): ChoiceOption<VehicleType>[] {
  const t = useTranslations("calculator.options.vehicleType");

  return VEHICLE_TYPE_ORDER.map((vehicleType) => {
    const VehicleIcon = VEHICLE_ICONS[vehicleType];
    return {
      value: vehicleType,
      label: t(vehicleType),
      hint: t(`${vehicleType}Hint`),
      icon: <VehicleIcon strokeWidth={1.5} />,
    };
  });
}

export function useParkingTypeOptions(): ChoiceOption<ParkingType>[] {
  const t = useTranslations("calculator.options.parkingType");

  return PARKING_TYPE_ORDER.map((parkingType) => ({
    value: parkingType,
    label: t(parkingType),
  }));
}

export function usePanelPlacementOptions(): ChoiceOption<SolarPanelPlacement>[] {
  const t = useTranslations("calculator.options.solarPanelPlacement");

  return PANEL_PLACEMENT_SUN_RATINGS.map(([placement, sunRating]) => ({
    value: placement,
    label: t(placement),
    hint: t(`${placement}Hint`),
    sunRating,
  }));
}

export function useCalculatorSteps(): CalculatorStep[] {
  const t = useTranslations("calculator.steps");

  return CALCULATOR_STEP_KEYS.map((stepKey) => ({
    label: t(stepKey),
    hint: t(`${stepKey}Hint`),
  }));
}
