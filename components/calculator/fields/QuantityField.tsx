"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import NumberStepper, {
  DEFAULT_STEPPER_MAXIMUM,
  DEFAULT_STEPPER_MINIMUM,
} from "@/components/form/NumberStepper";
import type { CalculatorFormValues } from "@/lib/calculator-form";

export default function QuantityField() {
  const t = useTranslations("calculator.quantity");
  const { control } = useFormContext<CalculatorFormValues>();

  return (
    <Controller
      control={control}
      name="quantity"
      render={({ field }) => (
        <NumberStepper
          label={t("label")}
          hint={t("hint")}
          value={field.value}
          decreaseLabel={t("decrease")}
          increaseLabel={t("increase")}
          rangeErrorMessage={t("rangeError", {
            minimum: DEFAULT_STEPPER_MINIMUM,
            maximum: DEFAULT_STEPPER_MAXIMUM,
          })}
          onChange={field.onChange}
        />
      )}
    />
  );
}
