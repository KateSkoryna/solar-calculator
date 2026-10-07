import { ReactNode } from "react";

interface PageTitleProps {
  children: ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <h1 className="font-display font-extrabold text-lime text-center mb-6 text-2xl md:text-[2rem] lg:text-[2.5rem] leading-tight">
      {children}
    </h1>
  );
}
