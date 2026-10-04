"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import Input from "@/components/form/Input";
import type {
  CalculatorFormValues,
  OptionalNumberField as OptionalNumberFieldName,
} from "@/lib/calculator-form";

function parseOptionalNumber(typedValue: unknown) {
  const trimmedText = String(typedValue ?? "")
    .trim()
    .replace(",", ".");
  return trimmedText === "" ? undefined : Number(trimmedText);
}

interface OptionalNumberFieldProps {
  name: OptionalNumberFieldName;
}

export default function OptionalNumberField({
  name,
}: OptionalNumberFieldProps) {
  const t = useTranslations("calculator.exactNumbers");
  const {
    register,
    formState: { errors },
  } = useFormContext<CalculatorFormValues>();

  return (
    <Input
      {...register(name, { setValueAs: parseOptionalNumber })}
      label={t(`${name}.label`)}
      hint={t(`${name}.hint`)}
      inputMode="decimal"
      error={errors[name] ? t("invalidNumber") : undefined}
    />
  );
}
