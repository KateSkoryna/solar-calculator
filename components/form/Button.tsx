import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import {
  buildButtonClassName,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_VARIANT,
  type ButtonSize,
  type ButtonVariant,
} from "@/lib/button-styles";

type ButtonIconPosition = "start" | "end";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
  loading?: boolean;
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export default function Button({
  variant = DEFAULT_BUTTON_VARIANT,
  size = DEFAULT_BUTTON_SIZE,
  icon,
  iconPosition = "start",
  loading = false,
  fullWidth = false,
  type = "button",
  disabled = false,
  className = "",
  children,
  ...buttonAttributes
}: ButtonProps) {
  const isInactive = disabled || loading;
  const visibleIcon = loading ? (
    <LuLoaderCircle aria-hidden="true" className="size-5 animate-spinner" />
  ) : (
    icon
  );

  return (
    <button
      {...buttonAttributes}
      type={type}
      disabled={isInactive}
      aria-busy={loading ? "true" : undefined}
      className={buildButtonClassName({
        variant,
        size,
        fullWidth,
        inactive: isInactive,
        className,
      })}
    >
      {iconPosition === "start" && visibleIcon}
      {children}
      {iconPosition === "end" && visibleIcon}
    </button>
  );
}
