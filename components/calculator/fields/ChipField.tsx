"use client";

import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Text from "@/components/common/Text";
import ChipGroup from "@/components/form/ChipGroup";
import type { CalculatorFormValues } from "@/lib/calculator-form";
import type { ChoiceOption } from "@/lib/choice-option";

interface ChipFieldProps {
  name: keyof CalculatorFormValues;
  label: string;
  hint?: string;
  options: ChoiceOption<string>[];
}

export default function ChipField({
  name,
  label,
  hint,
  options,
}: ChipFieldProps) {
  const { control } = useFormContext<CalculatorFormValues>();
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2.5 text-left">
      <div className="flex flex-col gap-0.5">
        <Text as="span" size="body" className="font-semibold">
          <span id={labelId}>{label}</span>
        </Text>
        {hint && (
          <Text size="caption" tone="muted">
            {hint}
          </Text>
        )}
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <ChipGroup
            name={field.name}
            labelledBy={labelId}
            options={options}
            value={typeof field.value === "string" ? field.value : null}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}
