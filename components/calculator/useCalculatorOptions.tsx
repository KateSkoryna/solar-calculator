import { useTranslations } from "next-intl";
import type {
  CargoType,
  ParkingType,
  SolarPanelPlacement,
  VehicleType,
} from "@/app/generated/prisma/enums";
import type { CalculatorStep } from "@/components/calculator/StepIndicator";
import { VEHICLE_ICONS } from "@/components/icons/vehicle-icons";
import {
  DISTANCE_BANDS,
  IDLING_FREQUENCIES,
  type DistanceBand,
  type IdlingFrequency,
} from "@/lib/assumptions/types";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import {
  CALCULATOR_STEP_KEYS,
  COOLING_UNIT_CHOICES,
} from "@/lib/calculator-form";
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

const CARGO_TYPE_ORDER: CargoType[] = ["REGULAR", "CHILLED", "PASSENGERS"];

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

export function useCargoTypeOptions(): ChoiceOption<CargoType>[] {
  const t = useTranslations("calculator.options.cargoType");

  return CARGO_TYPE_ORDER.map((cargoType) => ({
    value: cargoType,
    label: t(cargoType),
  }));
}

export function useDistanceBandOptions(): ChoiceOption<DistanceBand>[] {
  const t = useTranslations("calculator.options.distanceBand");

  return DISTANCE_BANDS.map((distanceBand) => {
    const dailyKilometres = Object.values(
      ASSUMPTION_SET_V1.distanceBands[distanceBand].value,
    );
    return {
      value: distanceBand,
      label: t(distanceBand),
      hint: t("rangeHint", {
        minimum: Math.min(...dailyKilometres),
        maximum: Math.max(...dailyKilometres),
        example: t(`${distanceBand}Example`),
      }),
    };
  });
}

export function useIdlingFrequencyOptions(): ChoiceOption<IdlingFrequency>[] {
  const t = useTranslations("calculator.options.idlingFrequency");

  return IDLING_FREQUENCIES.map((idlingFrequency) => ({
    value: idlingFrequency,
    label: t(idlingFrequency),
  }));
}

export function useCoolingUnitOptions(): ChoiceOption<
  (typeof COOLING_UNIT_CHOICES)[number]
>[] {
  const t = useTranslations("calculator.options.coolingUnitType");

  return COOLING_UNIT_CHOICES.map((coolingUnit) => ({
    value: coolingUnit,
    label: t(coolingUnit),
  }));
}
