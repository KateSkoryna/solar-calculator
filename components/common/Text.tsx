import type { ElementType, ReactNode } from "react";
import { TEXT_TONE_CLASSES, type TextTone } from "@/components/common/Heading";

export const TEXT_SIZES = ["body-l", "body", "small", "caption"] as const;

type TextSize = (typeof TEXT_SIZES)[number];

const TEXT_SIZE_CLASSES: Record<TextSize, string> = {
  "body-l": "text-[17px] leading-[1.55] md:text-[19px] lg:text-xl",
  body: "text-[15px] leading-[1.55] md:text-base",
  small: "text-sm leading-normal",
  caption: "text-[13px] leading-[1.4]",
};

interface TextProps {
  as?: ElementType;
  size?: TextSize;
  tone?: TextTone;
  className?: string;
  children: ReactNode;
}

export default function Text({
  as: Element = "p",
  size = "body",
  tone = "ink",
  className = "",
  children,
}: TextProps) {
  return (
    <Element
      className={`${TEXT_SIZE_CLASSES[size]} ${TEXT_TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </Element>
  );
}
