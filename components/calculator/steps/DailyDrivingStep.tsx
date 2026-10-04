"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import ChipField from "@/components/calculator/fields/ChipField";
import ChoiceCardField from "@/components/calculator/fields/ChoiceCardField";
import ExactNumbersDisclosure from "@/components/calculator/fields/ExactNumbersDisclosure";
import OptionalNumberField from "@/components/calculator/fields/OptionalNumberField";
import {
  useCoolingUnitOptions,
  useDistanceBandOptions,
  useIdlingFrequencyOptions,
} from "@/components/calculator/useCalculatorOptions";
import {
  CHILLED_CARGO_TYPE,
  type CalculatorFormValues,
} from "@/lib/calculator-form";
import { CALCULATOR_QUESTION_ID } from "@/lib/calculator-question";

export default function DailyDrivingStep() {
  const t = useTranslations("calculator.questions");
  const { control } = useFormContext<CalculatorFormValues>();
  const cargoType = useWatch({ control, name: "cargoType" });
  const coolingUnitOptions = useCoolingUnitOptions();

  return (
    <>
      <ChoiceCardField
        name="distanceBand"
        labelledBy={CALCULATOR_QUESTION_ID}
        options={useDistanceBandOptions()}
        layout="horizontal"
      />
      <ChipField
        name="idlingFrequency"
        label={t("idlingFrequency")}
        hint={t("idlingFrequencyHint")}
        options={useIdlingFrequencyOptions()}
      />
      <ExactNumbersDisclosure>
        <OptionalNumberField name="averageDailyDistanceKm" />
        <OptionalNumberField name="idleHoursPerDay" />
        <OptionalNumberField name="energyConsumptionKwhPer100km" />
        <OptionalNumberField name="operatingMonthsPerYear" />
        {cargoType === CHILLED_CARGO_TYPE && (
          <div className="md:col-span-2">
            <ChipField
              name="coolingUnitType"
              label={t("coolingUnitType")}
              options={coolingUnitOptions}
            />
          </div>
        )}
      </ExactNumbersDisclosure>
    </>
  );
}
