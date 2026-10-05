import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import {
  buildButtonClassName,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_VARIANT,
  type ButtonSize,
  type ButtonVariant,
} from "@/lib/button-styles";

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export default function ButtonLink({
  variant = DEFAULT_BUTTON_VARIANT,
  size = DEFAULT_BUTTON_SIZE,
  icon,
  fullWidth = false,
  className = "",
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link
      {...linkProps}
      className={buildButtonClassName({
        variant,
        size,
        fullWidth,
        inactive: false,
        className,
      })}
    >
      {children}
      {icon}
    </Link>
  );
}
