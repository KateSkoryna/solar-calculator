import { useId, type SelectHTMLAttributes } from "react";
import DropdownChevron from "@/components/common/DropdownChevron";
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
  compact?: boolean;
}

export default function Select({
  label,
  options,
  compact = false,
  id,
  className = "",
  ...selectAttributes
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const sizeClasses = compact ? "h-12 pl-3" : "h-14 pl-4";

  return (
    <div className="flex flex-col gap-2 text-left">
      <FieldLabel htmlFor={selectId}>{label}</FieldLabel>
      <div className="relative">
        <select
          {...selectAttributes}
          id={selectId}
          className={`${sizeClasses} w-full appearance-none rounded-md border border-line-strong bg-surface pr-12 text-base text-ink focus:border-ink focus:shadow-ring-selected focus:outline-none ${className}`}
        >
          {options.map(({ value, label: optionLabel }) => (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          ))}
        </select>
        <DropdownChevron
          rotatesWhenOpen={false}
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink"
        />
      </div>
    </div>
  );
}
