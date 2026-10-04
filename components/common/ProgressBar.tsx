import { useId } from "react";

export const PROGRESS_BAR_TONES = ["report", "step"] as const;

type ProgressBarTone = (typeof PROGRESS_BAR_TONES)[number];

const PROGRESS_BAR_FILL_CLASSES: Record<ProgressBarTone, string> = {
  report: "bg-chart-profit",
  step: "bg-ink",
};

const MINIMUM_PROGRESS_VALUE = 0;
const DEFAULT_MAXIMUM_PROGRESS_VALUE = 100;
const FULL_WIDTH_PERCENT = 100;

interface ProgressBarProps {
  value: number;
  label: string;
  max?: number;
  tone?: ProgressBarTone;
}

export default function ProgressBar({
  value,
  label,
  max = DEFAULT_MAXIMUM_PROGRESS_VALUE,
  tone = "report",
}: ProgressBarProps) {
  const labelId = useId();
  const hasValidRange = max > MINIMUM_PROGRESS_VALUE && Number.isFinite(value);
  const clampedValue = hasValidRange
    ? Math.min(Math.max(value, MINIMUM_PROGRESS_VALUE), max)
    : MINIMUM_PROGRESS_VALUE;
  const filledPercent = hasValidRange
    ? (clampedValue / max) * FULL_WIDTH_PERCENT
    : MINIMUM_PROGRESS_VALUE;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={MINIMUM_PROGRESS_VALUE}
        aria-valuemax={max}
        aria-labelledby={labelId}
        className="h-2.5 w-full overflow-hidden rounded-full bg-track"
      >
        <div
          className={`h-full animate-fill rounded-full ${PROGRESS_BAR_FILL_CLASSES[tone]}`}
          style={{ width: `${filledPercent}%` }}
        />
      </div>
      <p id={labelId} className="text-sm text-muted">
        {label}
      </p>
    </div>
  );
}
