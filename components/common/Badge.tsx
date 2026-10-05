import type { ReactNode } from "react";

export const BADGE_VARIANTS = ["sample", "info"] as const;

type BadgeVariant = (typeof BADGE_VARIANTS)[number];

const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  sample: "bg-soft px-2.5 py-1 text-xs text-muted",
  info: "bg-lime-soft px-3.5 py-2 text-[13px] text-lime-soft-ink",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${BADGE_VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
