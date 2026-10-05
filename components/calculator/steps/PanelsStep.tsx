"use client";

import ChoiceCardField from "@/components/calculator/fields/ChoiceCardField";
import ExactNumbersDisclosure from "@/components/calculator/fields/ExactNumbersDisclosure";
import OptionalNumberField from "@/components/calculator/fields/OptionalNumberField";
import { usePanelPlacementOptions } from "@/components/calculator/useCalculatorOptions";
import { CALCULATOR_QUESTION_ID } from "@/lib/calculator-question";

export default function PanelsStep() {
  return (
    <>
      <ChoiceCardField
        name="solarPanelPlacement"
        labelledBy={CALCULATOR_QUESTION_ID}
        options={usePanelPlacementOptions()}
        layout="horizontal"
      />
      <ExactNumbersDisclosure>
        <OptionalNumberField name="solarPanelCapacityKw" />
        <OptionalNumberField name="maxRoofLoadKg" />
        <OptionalNumberField name="payloadReserveKg" />
      </ExactNumbersDisclosure>
    </>
  );
}
