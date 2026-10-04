import type { ElementType, ReactNode } from "react";

export const CARD_TONES = [
  "default",
  "soft",
  "hero",
  "forest",
  "lime-soft",
] as const;

type CardTone = (typeof CARD_TONES)[number];

const CARD_TONE_CLASSES: Record<CardTone, string> = {
  default: "border-line bg-surface text-ink",
  soft: "border-transparent bg-soft text-ink",
  hero: "border-transparent bg-hero text-white",
  forest: "border-transparent bg-forest text-white",
  "lime-soft": "border-transparent bg-lime-soft text-lime-soft-ink",
};

const CARD_HEADER_BORDER_CLASSES: Record<CardTone, string> = {
  default: "border-line",
  soft: "border-line",
  hero: "border-white/20",
  forest: "border-white/20",
  "lime-soft": "border-lime-soft-ink/20",
};

interface CardProps {
  as?: ElementType;
  tone?: CardTone;
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function Card({
  as: Element = "div",
  tone = "default",
  title,
  action,
  className = "",
  children,
}: CardProps) {
  const hasHeader = Boolean(title) || Boolean(action);

  return (
    <Element
      className={`rounded-xl border p-5 md:p-6 lg:p-8 ${CARD_TONE_CLASSES[tone]} ${className}`}
    >
      {hasHeader && (
        <div
          className={`mb-5 flex items-center justify-between gap-4 border-b pb-4 ${CARD_HEADER_BORDER_CLASSES[tone]}`}
        >
          <div className="font-display text-[22px] font-bold lg:text-[28px]">
            {title}
          </div>
          {action}
        </div>
      )}
      {children}
    </Element>
  );
}
