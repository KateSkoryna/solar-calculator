import { useTranslations } from "next-intl";
import Card from "@/components/common/Card";
import Disclosure from "@/components/common/Disclosure";
import Text from "@/components/common/Text";
import AccuracyMeter from "@/components/calculator/AccuracyMeter";
import AnswersList, {
  type AnswerRow,
} from "@/components/calculator/AnswersList";
import type { EstimateAccuracy } from "@/lib/estimate-accuracy";

interface AnswersPanelProps {
  answers: AnswerRow[];
  accuracy: EstimateAccuracy;
  summary: string;
}

export default function AnswersPanel({
  answers,
  accuracy,
  summary,
}: AnswersPanelProps) {
  const t = useTranslations("calculator.answers");

  return (
    <aside aria-label={t("title")} className="hidden text-left md:block">
      <div className="hidden flex-col gap-4 rounded-xl bg-soft p-6 lg:flex">
        <Text
          size="caption"
          tone="muted"
          className="font-semibold tracking-[0.06em] uppercase"
        >
          {t("title")}
        </Text>
        <Card className="!p-5">
          <AnswersList answers={answers} />
        </Card>
        <Card className="!p-5">
          <AccuracyMeter accuracy={accuracy} />
        </Card>
      </div>
      <div className="lg:hidden">
        <Disclosure summary={t("collapsedSummary", { summary })}>
          <div className="flex flex-col gap-5">
            <AnswersList answers={answers} />
            <AccuracyMeter accuracy={accuracy} />
          </div>
        </Disclosure>
      </div>
    </aside>
  );
}
