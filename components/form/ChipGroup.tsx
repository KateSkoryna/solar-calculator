import VisuallyHiddenRadio from "@/components/form/VisuallyHiddenRadio";
import type { ChoiceOption } from "@/lib/choice-option";

interface ChipGroupProps<Value extends string> {
  name: string;
  label?: string;
  labelledBy?: string;
  options: ChoiceOption<Value>[];
  value: Value | null;
  onChange: (value: Value) => void;
}

export default function ChipGroup<Value extends string>({
  name,
  label,
  labelledBy,
  options,
  value,
  onChange,
}: ChipGroupProps<Value>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      className="flex flex-wrap gap-2.5"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line-strong bg-surface px-4 text-[15px] font-semibold text-ink transition-colors duration-200 hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-ground has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
        >
          <VisuallyHiddenRadio
            name={name}
            value={option.value}
            checked={option.value === value}
            disabled={option.disabled}
            onSelect={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
