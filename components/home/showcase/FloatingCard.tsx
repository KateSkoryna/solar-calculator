import type { ReactNode } from "react";

export const FLOATING_CARD_TONES = ["surface", "lime"] as const;

type FloatingCardTone = (typeof FLOATING_CARD_TONES)[number];

const FLOATING_CARD_TONE_CLASSES: Record<FloatingCardTone, string> = {
  surface: "bg-surface text-ink",
  lime: "bg-lime text-on-lime",
};

interface FloatingCardProps {
  tone?: FloatingCardTone;
  className?: string;
  children: ReactNode;
}

export default function FloatingCard({
  tone = "surface",
  className = "",
  children,
}: FloatingCardProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute hidden rounded-lg px-4 py-3.5 text-left shadow-float md:block ${FLOATING_CARD_TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
