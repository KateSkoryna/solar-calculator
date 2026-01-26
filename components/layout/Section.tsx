import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export default function Section({ children, className = "" }: SectionProps) {
  return (
    <div
      className={`mx-auto text-center py-4 sm:py-6 md:py-8 lg:py-12 ${className}`}
    >
      {children}
    </div>
  );
}
