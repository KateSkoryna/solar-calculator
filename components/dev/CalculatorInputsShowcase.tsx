"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ParkingType,
  SolarPanelPlacement,
  VehicleType,
} from "@/app/generated/prisma/enums";
import AnswersPanel from "@/components/calculator/AnswersPanel";
import StepIndicator from "@/components/calculator/StepIndicator";
import {
  useCalculatorSteps,
  usePanelPlacementOptions,
  useParkingTypeOptions,
  useVehicleTypeOptions,
} from "@/components/calculator/useCalculatorOptions";
import Text from "@/components/common/Text";
import ShowcaseSection from "@/components/dev/ShowcaseSection";
import ChipGroup from "@/components/form/ChipGroup";
import ChoiceCardGroup from "@/components/form/ChoiceCardGroup";
import NumberStepper, {
  DEFAULT_STEPPER_MAXIMUM,
  DEFAULT_STEPPER_MINIMUM,
} from "@/components/form/NumberStepper";
import { estimateAccuracy } from "@/lib/estimate-accuracy";

const SAMPLE_QUANTITY = 10;
const SAMPLE_STEP_INDEX = 1;

export default function CalculatorInputsShowcase() {
  const t = useTranslations("devShowcase");
  const tCalculator = useTranslations("calculator");
  const vehicleTypeOptions = useVehicleTypeOptions();
  const parkingTypeOptions = useParkingTypeOptions();
  const panelPlacementOptions = usePanelPlacementOptions();
  const calculatorSteps = useCalculatorSteps();
  const [vehicleType, setVehicleType] = useState<VehicleType>("VAN");
  const [parkingType, setParkingType] = useState<ParkingType>("DEPOT");
  const [panelPlacement, setPanelPlacement] =
    useState<SolarPanelPlacement>("ROOF");
  const [quantity, setQuantity] = useState(SAMPLE_QUANTITY);
  const [stepIndex, setStepIndex] = useState(SAMPLE_STEP_INDEX);

  const vehicleTypeLabel = tCalculator(`options.vehicleType.${vehicleType}`);
  const vehiclesSummary = tCalculator("answers.vehiclesValue", {
    quantity,
    vehicleType: vehicleTypeLabel,
  });
  const answers = [
    { label: tCalculator("answers.vehicles"), value: vehiclesSummary },
    { label: tCalculator("answers.dailyDistance"), value: null },
    { label: tCalculator("answers.location"), value: t("sampleLocation") },
    {
      label: tCalculator("answers.panels"),
      value: tCalculator(`options.solarPanelPlacement.${panelPlacement}`),
    },
  ];
  const accuracy = estimateAccuracy({
    vehicleType: "PROVIDED",
    quantity: "PROVIDED",
    city: "PROVIDED",
    solarPanelPlacement: "PROVIDED",
    parkingType: "PROVIDED",
    energyConsumptionKwhPer100km: "PRESET",
    solarPanelCapacityKw: "PRESET",
    idleHoursPerDay: "PRESET",
  });

  return (
    <>
      <ShowcaseSection title={t("sections.choiceCard")}>
        <Text tone="muted">{tCalculator("questions.vehicleType")}</Text>
        <ChoiceCardGroup
          name="showcase-vehicle-type"
          label={tCalculator("questions.vehicleType")}
          options={vehicleTypeOptions}
          value={vehicleType}
          onChange={setVehicleType}
        />
        <Text tone="muted">{tCalculator("questions.solarPanelPlacement")}</Text>
        <ChoiceCardGroup
          name="showcase-panel-placement"
          label={tCalculator("questions.solarPanelPlacement")}
          options={panelPlacementOptions}
          value={panelPlacement}
          layout="horizontal"
          onChange={setPanelPlacement}
        />
        <ChoiceCardGroup
          name="showcase-vehicle-type-compact"
          label={tCalculator("questions.vehicleType")}
          options={vehicleTypeOptions}
          value={vehicleType}
          layout="compact"
          onChange={setVehicleType}
        />
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.chipGroup")}>
        <Text tone="muted">{tCalculator("questions.parkingType")}</Text>
        <ChipGroup
          name="showcase-parking-type"
          label={tCalculator("questions.parkingType")}
          options={parkingTypeOptions}
          value={parkingType}
          onChange={setParkingType}
        />
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.numberStepper")}>
        <NumberStepper
          label={tCalculator("quantity.label")}
          hint={tCalculator("quantity.hint")}
          value={quantity}
          decreaseLabel={tCalculator("quantity.decrease")}
          increaseLabel={tCalculator("quantity.increase")}
          rangeErrorMessage={tCalculator("quantity.rangeError", {
            minimum: DEFAULT_STEPPER_MINIMUM,
            maximum: DEFAULT_STEPPER_MAXIMUM,
          })}
          onChange={setQuantity}
        />
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.stepIndicator")}>
        <StepIndicator
          steps={calculatorSteps}
          currentStepIndex={stepIndex}
          onStepSelect={setStepIndex}
        />
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.answersPanel")}>
        <AnswersPanel
          answers={answers}
          accuracy={accuracy}
          summary={vehiclesSummary}
        />
      </ShowcaseSection>
    </>
  );
}
