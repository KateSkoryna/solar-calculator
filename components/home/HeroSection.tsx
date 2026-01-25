import { ReactNode } from "react";

interface HeroSectionProps {
  children: ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="relative">
      <div
        className=" absolute top-1/2 -translate-y-1/2
      left-1/2 -translate-x-1/2
      w-[90%] h-[95%]
      -z-10 overflow-hidden

      lg:left-auto lg:-translate-x-0 lg:right-8
      lg:w-[40%]"
      >
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
