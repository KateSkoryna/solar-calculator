"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { ChoiceCardLayout } from "@/components/form/ChoiceCard";
import ChoiceCardGroup from "@/components/form/ChoiceCardGroup";
import type { CalculatorFormValues } from "@/lib/calculator-form";
import type { ChoiceOption } from "@/lib/choice-option";

interface ChoiceCardFieldProps {
  name: keyof CalculatorFormValues;
  labelledBy: string;
  options: ChoiceOption<string>[];
  layout?: ChoiceCardLayout;
}

export default function ChoiceCardField({
  name,
  labelledBy,
  options,
  layout,
}: ChoiceCardFieldProps) {
  const { control } = useFormContext<CalculatorFormValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ChoiceCardGroup
          name={field.name}
          labelledBy={labelledBy}
          options={options}
          value={typeof field.value === "string" ? field.value : null}
          layout={layout}
          onChange={field.onChange}
        />
      )}
    />
  );
}
