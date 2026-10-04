import type { ReactNode } from "react";

export interface ChoiceOption<Value extends string> {
  value: Value;
  label: string;
  hint?: string;
  icon?: ReactNode;
  sunRating?: number;
  disabled?: boolean;
}
