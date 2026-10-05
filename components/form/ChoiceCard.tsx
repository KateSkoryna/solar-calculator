import type { ReactNode } from "react";
import SunDots from "@/components/common/SunDots";
import Text from "@/components/common/Text";
import VisuallyHiddenRadio from "@/components/form/VisuallyHiddenRadio";

export const CHOICE_CARD_LAYOUTS = [
  "vertical",
  "horizontal",
  "compact",
] as const;

export type ChoiceCardLayout = (typeof CHOICE_CARD_LAYOUTS)[number];

const CHOICE_CARD_LAYOUT_CLASSES: Record<ChoiceCardLayout, string> = {
  vertical: "flex-col items-start gap-2.5 p-3",
  horizontal: "flex-row items-center gap-4 p-4",
  compact: "flex-col items-start gap-2.5 p-3.5",
};

const LABEL_LAYOUT_CLASSES: Record<ChoiceCardLayout, string> = {
  vertical: "text-base break-words",
  horizontal: "text-lg",
  compact: "text-lg",
};

const ICON_TILE_LAYOUT_CLASSES: Record<ChoiceCardLayout, string> = {
  vertical: "size-12 [&>svg]:size-8",
  horizontal: "size-16 [&>svg]:size-10",
  compact: "size-12 [&>svg]:size-8",
};

interface ChoiceCardProps {
  name: string;
  value: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  sunRating?: number;
  layout?: ChoiceCardLayout;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export default function ChoiceCard({
  name,
  value,
  label,
  hint,
  icon,
  sunRating,
  layout = "vertical",
  checked,
  disabled = false,
  onSelect,
}: ChoiceCardProps) {
  return (
    <label
      className={`flex cursor-pointer rounded-lg border-2 border-line bg-surface text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-hover has-[:checked]:border-ink has-[:checked]:shadow-ring-selected has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${CHOICE_CARD_LAYOUT_CLASSES[layout]}`}
    >
      <VisuallyHiddenRadio
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onSelect={onSelect}
      />
      {icon && (
        <span
          aria-hidden="true"
          className={`flex shrink-0 items-center justify-center rounded-lg bg-ground text-ink ${ICON_TILE_LAYOUT_CLASSES[layout]}`}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={`font-body leading-[1.3] font-semibold text-ink ${LABEL_LAYOUT_CLASSES[layout]}`}
        >
          {label}
        </span>
        {hint && (
          <Text as="span" size="small" tone="muted">
            {hint}
          </Text>
        )}
      </span>
      {sunRating !== undefined && <SunDots rating={sunRating} />}
    </label>
  );
}
