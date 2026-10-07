import type { ReactNode } from "react";

interface MockScreenProps {
  label: string;
  className?: string;
  children: ReactNode;
}

export default function MockScreen({
  label,
  className = "",
  children,
}: MockScreenProps) {
  return (
    <div role="img" aria-label={label} className={className}>
      {children}
    </div>
  );
}
