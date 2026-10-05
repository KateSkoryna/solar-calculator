import type { ReactNode } from "react";
import Heading from "@/components/common/Heading";

interface ShowcaseSectionProps {
  title: string;
  children: ReactNode;
}

export default function ShowcaseSection({
  title,
  children,
}: ShowcaseSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <Heading level={2} size="title">
        {title}
      </Heading>
      {children}
    </section>
  );
}
