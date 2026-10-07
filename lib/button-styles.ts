import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";

export const BUTTON_VARIANTS = [
  "primary",
  "dark",
  "secondary",
  "ghost",
  "danger",
  "on-dark",
] as const;

export const BUTTON_SIZES = ["lg", "md", "sm"] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];

export const DEFAULT_BUTTON_VARIANT: ButtonVariant = "primary";
export const DEFAULT_BUTTON_SIZE: ButtonSize = "md";

const BUTTON_BASE_CLASSES =
  "inline-flex cursor-pointer items-center justify-center rounded-full border font-body font-semibold transition duration-200 ease-standard active:translate-y-0";

const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-lime text-on-lime hover:-translate-y-px hover:brightness-95",
  dark: "border-transparent bg-hero text-white hover:border-ink hover:opacity-90",
  secondary: "border-line-strong bg-surface text-ink hover:border-ink",
  ghost: "border-transparent bg-transparent text-ink hover:border-ink",
  danger: "border-transparent bg-danger text-white hover:border-ink",
  "on-dark": "border-white/40 bg-transparent text-white hover:border-white",
};

const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  lg: "min-h-14 gap-2.5 px-8 text-[17px]",
  md: "min-h-12 gap-2 px-6 text-base",
  sm: "min-h-10 gap-2 px-4 text-sm",
};

const BUTTON_INACTIVE_CLASSES =
  "pointer-events-none cursor-not-allowed opacity-50";

interface ButtonClassNameOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  inactive: boolean;
  className: string;
}

export function buildButtonClassName({
  variant,
  size,
  fullWidth,
  inactive,
  className,
}: ButtonClassNameOptions): string {
  return [
    BUTTON_BASE_CLASSES,
    BUTTON_VARIANT_CLASSES[variant],
    BUTTON_SIZE_CLASSES[size],
    FOCUS_RING_CLASSES,
    fullWidth ? "w-full" : "",
    inactive ? BUTTON_INACTIVE_CLASSES : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
