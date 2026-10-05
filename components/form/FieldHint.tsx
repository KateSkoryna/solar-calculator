import type { ReactNode } from "react";

interface FieldHintProps {
  id: string;
  children: ReactNode;
}

export default function FieldHint({ id, children }: FieldHintProps) {
  return (
    <p id={id} className="text-[13px] text-muted">
      {children}
    </p>
  );
}
