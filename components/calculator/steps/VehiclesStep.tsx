"use client";

import { useTranslations } from "next-intl";
import ChipField from "@/components/calculator/fields/ChipField";
import ChoiceCardField from "@/components/calculator/fields/ChoiceCardField";
import QuantityField from "@/components/calculator/fields/QuantityField";
import {
  useCargoTypeOptions,
  useVehicleTypeOptions,
} from "@/components/calculator/useCalculatorOptions";
import { CALCULATOR_QUESTION_ID } from "@/lib/calculator-question";

export default function VehiclesStep() {
  const t = useTranslations("calculator.questions");

  return (
    <>
      <ChoiceCardField
        name="vehicleType"
        labelledBy={CALCULATOR_QUESTION_ID}
        options={useVehicleTypeOptions()}
      />
      <QuantityField />
      <ChipField
        name="cargoType"
        label={t("cargoType")}
        options={useCargoTypeOptions()}
      />
    </>
  );
}
