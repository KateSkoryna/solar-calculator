import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import { SCROLL_REVEAL_CLASSES } from "@/lib/scroll-animation";

interface SectionIntroProps {
  eyebrow: string;
  title: string;
  titleId: string;
  lead?: string;
  onDark?: boolean;
  centered?: boolean;
}

export default function SectionIntro({
  eyebrow,
  title,
  titleId,
  lead,
  onDark = false,
  centered = false,
}: SectionIntroProps) {
  const eyebrowClasses = onDark ? "text-lime" : "text-lime-soft-ink";
  const alignmentClasses = centered
    ? "mx-auto items-center text-center"
    : "items-start text-left";

  return (
    <div
      className={`flex max-w-[820px] flex-col gap-4 ${alignmentClasses} ${SCROLL_REVEAL_CLASSES.rise}`}
    >
      <p
        className={`text-sm font-semibold tracking-[0.08em] uppercase ${eyebrowClasses}`}
      >
        {eyebrow}
      </p>
      <Heading
        level={2}
        size="display-m"
        tone={onDark ? "on-dark" : "ink"}
        id={titleId}
      >
        {title}
      </Heading>
      {lead && (
        <Text size="body-l" tone={onDark ? "on-dark-muted" : "muted"}>
          {lead}
        </Text>
      )}
    </div>
  );
}
