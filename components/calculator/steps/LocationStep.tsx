"use client";

import type { Ref } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import ChipField from "@/components/calculator/fields/ChipField";
import { useParkingTypeOptions } from "@/components/calculator/useCalculatorOptions";
import CityCombobox from "@/components/form/CityCombobox";
import type { CalculatorFormValues } from "@/lib/calculator-form";

interface LocationStepProps {
  cityInputRef: Ref<HTMLInputElement>;
  isCityMissing: boolean;
}

export default function LocationStep({
  cityInputRef,
  isCityMissing,
}: LocationStepProps) {
  const t = useTranslations("calculator");
  const { control } = useFormContext<CalculatorFormValues>();

  return (
    <>
      <Controller
        control={control}
        name="city"
        render={({ field }) => (
          <CityCombobox
            label={t("city.label")}
            placeholder={t("city.placeholder")}
            hint={t("city.hint")}
            error={
              isCityMissing && field.value === null
                ? t("city.required")
                : undefined
            }
            value={field.value}
            inputRef={cityInputRef}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <ChipField
        name="parkingType"
        label={t("questions.parkingType")}
        options={useParkingTypeOptions()}
      />
    </>
  );
}
