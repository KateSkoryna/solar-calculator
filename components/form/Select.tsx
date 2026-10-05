import { useId, type SelectHTMLAttributes } from "react";
import FieldLabel from "@/components/form/FieldLabel";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  label: string;
  options: SelectOption[];
}

export default function Select({
  label,
  options,
  id,
  className = "",
  ...selectAttributes
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2 text-left">
      <FieldLabel htmlFor={selectId}>{label}</FieldLabel>
      <select
        {...selectAttributes}
        id={selectId}
        className={`h-14 w-full rounded-md border border-line-strong bg-surface px-4 text-base text-ink focus:border-ink focus:shadow-ring-selected focus:outline-none ${className}`}
      >
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
