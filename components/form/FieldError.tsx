import type { ReactNode } from "react";
import { LuCircleAlert } from "react-icons/lu";

interface FieldErrorProps {
  id: string;
  announce?: boolean;
  children: ReactNode;
}

export default function FieldError({
  id,
  announce = false,
  children,
}: FieldErrorProps) {
  return (
    <p
      id={id}
      role={announce ? "alert" : undefined}
      className="flex items-center gap-1.5 text-[13px] font-semibold text-danger"
    >
      <LuCircleAlert aria-hidden="true" className="size-4 shrink-0" />
      {children}
    </p>
  );
}
