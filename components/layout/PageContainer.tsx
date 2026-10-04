import type { ElementType, ReactNode } from "react";

interface PageContainerProps {
  as?: ElementType;
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}

export default function PageContainer({
  as: Element = "div",
  id,
  labelledBy,
  className = "",
  children,
}: PageContainerProps) {
  return (
    <Element
      id={id}
      aria-labelledby={labelledBy}
      className={`mx-auto w-full max-w-[1440px] px-4 md:px-10 lg:px-20 ${className}`}
    >
      {children}
    </Element>
  );
}
