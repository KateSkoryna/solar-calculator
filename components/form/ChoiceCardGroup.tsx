import ChoiceCard, {
  type ChoiceCardLayout,
} from "@/components/form/ChoiceCard";
import type { ChoiceOption } from "@/lib/choice-option";

const CHOICE_CARD_GROUP_LAYOUT_CLASSES: Record<ChoiceCardLayout, string> = {
  vertical: "grid-cols-2 lg:grid-cols-4",
  horizontal: "grid-cols-1 md:grid-cols-2",
  compact: "grid-cols-2",
};

interface ChoiceCardGroupProps<Value extends string> {
  name: string;
  label?: string;
  labelledBy?: string;
  options: ChoiceOption<Value>[];
  value: Value | null;
  layout?: ChoiceCardLayout;
  onChange: (value: Value) => void;
}

export default function ChoiceCardGroup<Value extends string>({
  name,
  label,
  labelledBy,
  options,
  value,
  layout = "vertical",
  onChange,
}: ChoiceCardGroupProps<Value>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      className={`grid gap-3 md:gap-4 ${CHOICE_CARD_GROUP_LAYOUT_CLASSES[layout]}`}
    >
      {options.map((option) => (
        <ChoiceCard
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          hint={option.hint}
          icon={option.icon}
          sunRating={option.sunRating}
          layout={layout}
          checked={option.value === value}
          disabled={option.disabled}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}
