import { useTranslations } from "next-intl";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import type { DurationParts, ResultsViewModel } from "@/lib/results-view-model";

const HIGHLIGHT_CLASSES = "rounded-[14px] bg-lime px-3 text-on-lime";

interface ResponsiveDurationProps {
  duration: DurationParts;
  highlighted: boolean;
}

function ResponsiveDuration({
  duration,
  highlighted,
}: ResponsiveDurationProps) {
  const { duration: formatDuration } = useResultsFormatters();

  return (
    <span className={highlighted ? HIGHLIGHT_CLASSES : ""}>
      <span className="md:hidden">{formatDuration(duration, "short")}</span>
      <span className="hidden md:inline">
        {formatDuration(duration, "long")}
      </span>
    </span>
  );
}

interface VerdictHeadlineProps {
  verdict: ResultsViewModel["verdict"];
}

export default function VerdictHeadline({ verdict }: VerdictHeadlineProps) {
  const t = useTranslations("results.verdict");
  const { duration: formatDuration, money } = useResultsFormatters();
  const { variant, duration, range, annualSavingsEuros } = verdict;

  return (
    <div className="flex flex-col gap-4">
      <Heading
        level={1}
        size="display-l"
        className="max-w-[1000px] animate-rise"
      >
        {duration === null
          ? t(variant)
          : t.rich(variant, {
              duration: () => (
                <ResponsiveDuration
                  duration={duration}
                  highlighted={variant === "PAYS_OFF"}
                />
              ),
            })}
      </Heading>
      {range && (
        <Text size="body-l" tone="muted" className="max-w-[760px] animate-rise">
          {range.longest === null
            ? t("rangeBestCase", {
                shortest: formatDuration(range.shortest, "long"),
              })
            : t("range", {
                shortest: formatDuration(range.shortest, "long"),
                longest: formatDuration(range.longest, "long"),
              })}
        </Text>
      )}
      <Text size="body-l" tone="muted" className="max-w-[760px] animate-rise">
        {variant === "UNLIKELY"
          ? t("unlikelySuggestion")
          : t("lead", { annualSavings: money(annualSavingsEuros) })}
      </Text>
    </div>
  );
}
