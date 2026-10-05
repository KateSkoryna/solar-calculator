import { useTranslations } from "next-intl";
import ProgressBar from "@/components/common/ProgressBar";
import Text from "@/components/common/Text";
import type {
  EstimateAccuracy,
  EstimateAccuracyLevel,
} from "@/lib/estimate-accuracy";

const ACCURACY_LEVEL_MESSAGE_KEYS: Record<EstimateAccuracyLevel, string> = {
  ROUGH: "rough",
  GOOD: "good",
  PRECISE: "precise",
};

const HIGHEST_ACCURACY_LEVEL: EstimateAccuracyLevel = "PRECISE";

interface AccuracyMeterProps {
  accuracy: EstimateAccuracy;
}

export default function AccuracyMeter({ accuracy }: AccuracyMeterProps) {
  const t = useTranslations("calculator.accuracy");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <Text as="span" size="small" tone="muted" className="font-semibold">
          {t("title")}
        </Text>
        <span className="font-display text-lg font-bold text-ink">
          {t(ACCURACY_LEVEL_MESSAGE_KEYS[accuracy.level])}
        </span>
      </div>
      <ProgressBar
        value={Math.round(accuracy.percent)}
        label={t(
          accuracy.level === HIGHEST_ACCURACY_LEVEL
            ? "preciseHelper"
            : "helper",
        )}
      />
    </div>
  );
}
