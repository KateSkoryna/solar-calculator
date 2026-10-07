import { useTranslations } from "next-intl";
import Card from "@/components/common/Card";
import Heading from "@/components/common/Heading";
import ProgressBar from "@/components/common/ProgressBar";
import Text from "@/components/common/Text";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import type { SavingsLine } from "@/lib/results-view-model";

interface SavingsBreakdownProps {
  lines: SavingsLine[];
}

export default function SavingsBreakdown({ lines }: SavingsBreakdownProps) {
  const t = useTranslations("results.breakdown");
  const { money } = useResultsFormatters();

  return (
    <Card as="section" className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1.5">
        <Heading level={2} size="title">
          {t("title")}
        </Heading>
        <Text tone="muted">{t("subtitle")}</Text>
      </div>
      <ul className="flex list-none flex-col gap-5">
        {lines.map((line) => (
          <li key={line.type} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <Text as="span" className="font-semibold">
                {t(`types.${line.type}`)}
              </Text>
              <Text as="span" className="font-semibold tabular-nums">
                {t("perYear", { amount: money(line.annualEuros) })}
              </Text>
            </div>
            <ProgressBar
              value={line.sharePercent}
              label={t(`hints.${line.type}`)}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
