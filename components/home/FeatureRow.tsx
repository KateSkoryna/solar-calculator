import type { ReactNode } from "react";
import { LuCheck } from "react-icons/lu";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import { SCROLL_REVEAL_CLASSES } from "@/lib/scroll-animation";

interface FeatureRowProps {
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
  extra?: ReactNode;
  previewFirst?: boolean;
  children: ReactNode;
}

export default function FeatureRow({
  eyebrow,
  title,
  body,
  points = [],
  extra,
  previewFirst = false,
  children,
}: FeatureRowProps) {
  const copyReveal = previewFirst
    ? SCROLL_REVEAL_CLASSES.fromRight
    : SCROLL_REVEAL_CLASSES.fromLeft;
  const previewReveal = previewFirst
    ? SCROLL_REVEAL_CLASSES.fromLeft
    : SCROLL_REVEAL_CLASSES.fromRight;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-18">
      <div
        className={`flex flex-col gap-4.5 text-left ${copyReveal} ${
          previewFirst ? "lg:order-last" : ""
        }`}
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-lime-soft-ink uppercase">
          {eyebrow}
        </p>
        <Heading level={3} size="display-s">
          {title}
        </Heading>
        <Text size="body-l" tone="muted">
          {body}
        </Text>
        {points.length > 0 && (
          <ul className="flex list-none flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <LuCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 stroke-[2.5] text-lime-soft-ink"
                />
                <Text as="span">{point}</Text>
              </li>
            ))}
          </ul>
        )}
        {extra}
      </div>
      <div className={previewReveal}>{children}</div>
    </div>
  );
}
