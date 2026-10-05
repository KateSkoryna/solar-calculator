import type { ReactNode } from "react";
import { LuCircleAlert } from "react-icons/lu";

interface FormAlertProps {
  action?: ReactNode;
  children: ReactNode;
}

export default function FormAlert({ action, children }: FormAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-md bg-warn-soft p-4 text-left text-warn-ink"
    >
      <p className="flex items-start gap-2 text-[15px] font-semibold">
        <LuCircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        {children}
      </p>
      {action}
    </div>
  );
}
