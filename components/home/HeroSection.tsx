import { ReactNode } from "react";

interface HeroSectionProps {
  children: ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="relative">
      <div className="absolute top-1/2 -translate-y-1/2 right-8 h-[95%] w-[40%] -z-10 overflow-hidden">
        <img
          src="/forestlight.webp"
          alt="Forest"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {children}
    </section>
  );
}
