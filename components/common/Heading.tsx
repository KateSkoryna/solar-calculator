import type { ReactNode, Ref } from "react";

export const HEADING_SIZES = [
  "display-xl",
  "display-l",
  "display-m",
  "display-s",
  "title",
  "heading",
] as const;

export const TEXT_TONES = ["ink", "muted", "on-dark", "on-dark-muted"] as const;

type HeadingSize = (typeof HEADING_SIZES)[number];
export type TextTone = (typeof TEXT_TONES)[number];
type HeadingLevel = 1 | 2 | 3 | 4;

const HEADING_SIZE_CLASSES: Record<HeadingSize, string> = {
  "display-xl":
    "font-display text-[40px] leading-[1.05] font-extrabold tracking-[-0.03em] md:text-[58px] md:leading-[1.03] lg:text-[72px] lg:leading-[1.02]",
  "display-l":
    "font-display text-[36px] leading-[1.1] font-extrabold tracking-[-0.03em] md:text-[50px] md:leading-[1.08] lg:text-[64px] lg:leading-[1.05]",
  "display-m":
    "font-display text-[32px] leading-[1.1] font-extrabold tracking-[-0.02em] md:text-[40px] lg:text-[44px]",
  "display-s":
    "font-display text-[30px] leading-[1.15] font-extrabold tracking-[-0.02em] md:text-[34px] lg:text-[40px]",
  title:
    "font-display text-[22px] leading-[1.25] font-bold md:text-[26px] lg:text-[28px]",
  heading:
    "font-body text-lg leading-[1.3] font-semibold md:text-xl lg:text-[22px]",
};

export const TEXT_TONE_CLASSES: Record<TextTone, string> = {
  ink: "text-ink",
  muted: "text-muted",
  "on-dark": "text-white",
  "on-dark-muted": "text-hero-muted",
};

const HEADING_TAGS = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

interface HeadingProps {
  level: HeadingLevel;
  size: HeadingSize;
  tone?: TextTone;
  id?: string;
  className?: string;
  tabIndex?: number;
  ref?: Ref<HTMLHeadingElement>;
  children: ReactNode;
}

export default function Heading({
  level,
  size,
  tone = "ink",
  id,
  className = "",
  tabIndex,
  ref,
  children,
}: HeadingProps) {
  const HeadingTag = HEADING_TAGS[level];

  return (
    <HeadingTag
      ref={ref}
      id={id}
      tabIndex={tabIndex}
      className={`${HEADING_SIZE_CLASSES[size]} ${TEXT_TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </HeadingTag>
  );
}
