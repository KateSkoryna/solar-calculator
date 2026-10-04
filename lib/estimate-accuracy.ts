import type { InputSources } from "@/lib/calculation-engine/types";

export const ESTIMATE_ACCURACY_LEVELS = [
  { level: "ROUGH", minimumPercent: 0 },
  { level: "GOOD", minimumPercent: 50 },
  { level: "PRECISE", minimumPercent: 90 },
] as const;

export type EstimateAccuracyLevel =
  (typeof ESTIMATE_ACCURACY_LEVELS)[number]["level"];

export interface EstimateAccuracy {
  percent: number;
  level: EstimateAccuracyLevel;
}

const FULL_PERCENT = 100;
const NO_ACCURACY_PERCENT = 0;
const UNCOUNTED_INPUT_SOURCE = "PRESET";

export function accuracyLevelForPercent(
  percent: number,
): EstimateAccuracyLevel {
  return ESTIMATE_ACCURACY_LEVELS.reduce<EstimateAccuracyLevel>(
    (reachedLevel, { level, minimumPercent }) =>
      percent >= minimumPercent ? level : reachedLevel,
    ESTIMATE_ACCURACY_LEVELS[0].level,
  );
}

export function estimateAccuracy(inputSources: InputSources): EstimateAccuracy {
  const sources = Object.values(inputSources);
  const countedSources = sources.filter(
    (source) => source !== UNCOUNTED_INPUT_SOURCE,
  );
  const percent =
    sources.length === 0
      ? NO_ACCURACY_PERCENT
      : (countedSources.length / sources.length) * FULL_PERCENT;

  return { percent, level: accuracyLevelForPercent(percent) };
}
