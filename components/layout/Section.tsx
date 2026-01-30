import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export default function HeroSectionCover({
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      className={`relative w-full min-w-full text-center py-4 sm:py-6 md:py-8 lg:py-12 bg-cover bg-center bg-[url('/forestdark.webp')] ${className}`}
    >
      <div className="relative z-10 mx-auto max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1600px] px-6 md:px-8 lg:px-12 xl:px-16">
        {children}
      </div>
    </section>
  );
}
