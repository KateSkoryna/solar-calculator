"use client";

import { useTranslations } from "next-intl";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";

export interface CalculatorStep {
  label: string;
  hint?: string;
}

type StepState = "done" | "current" | "upcoming";

const STEP_CIRCLE_CLASSES: Record<StepState, string> = {
  done: "bg-lime text-on-lime",
  current: "bg-ink text-ground",
  upcoming: "bg-track text-muted",
};

const STEP_BAR_CLASSES: Record<StepState, string> = {
  done: "bg-ink",
  current: "bg-ink",
  upcoming: "bg-track",
};

const STEP_LABEL_CLASSES: Record<StepState, string> = {
  done: "font-medium text-ink",
  current: "font-semibold text-ink",
  upcoming: "font-medium text-muted",
};

const FULL_WIDTH_PERCENT = 100;

function stepStateOf(stepIndex: number, currentStepIndex: number): StepState {
  if (stepIndex < currentStepIndex) return "done";
  if (stepIndex === currentStepIndex) return "current";
  return "upcoming";
}

interface StepIndicatorProps {
  steps: CalculatorStep[];
  currentStepIndex: number;
  onStepSelect?: (stepIndex: number) => void;
}

interface StepRenderingProps extends StepIndicatorProps {
  summary: string;
}

function StepRail({
  steps,
  currentStepIndex,
  onStepSelect,
}: StepIndicatorProps) {
  return (
    <ol className="hidden list-none flex-col gap-1 lg:flex">
      {steps.map((step, stepIndex) => {
        const stepState = stepStateOf(stepIndex, currentStepIndex);
        return (
          <li key={step.label} className="mb-0">
            <button
              type="button"
              aria-current={stepState === "current" ? "step" : undefined}
              disabled={stepState === "upcoming"}
              onClick={() => onStepSelect?.(stepIndex)}
              className={`flex min-h-[52px] w-full items-center justify-start gap-3 rounded-md px-2 py-1.5 text-left disabled:cursor-default disabled:opacity-100 ${FOCUS_RING_CLASSES}`}
            >
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${STEP_CIRCLE_CLASSES[stepState]}`}
              >
                {stepIndex + 1}
              </span>
              <span className="flex flex-col">
                <span className={`text-base ${STEP_LABEL_CLASSES[stepState]}`}>
                  {step.label}
                </span>
                {step.hint && (
                  <span className="text-[13px] font-normal text-muted">
                    {step.hint}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function StepBars({ steps, currentStepIndex }: StepIndicatorProps) {
  const t = useTranslations("calculator.stepIndicator");

  return (
    <ol className="hidden list-none grid-flow-col auto-cols-fr gap-3 md:grid lg:hidden">
      {steps.map((step, stepIndex) => {
        const stepState = stepStateOf(stepIndex, currentStepIndex);
        return (
          <li
            key={step.label}
            aria-current={stepState === "current" ? "step" : undefined}
            className="mb-0 flex flex-col gap-2"
          >
            <span
              aria-hidden="true"
              className={`h-1.5 rounded-full ${STEP_BAR_CLASSES[stepState]}`}
            />
            <span className={`text-sm ${STEP_LABEL_CLASSES[stepState]}`}>
              {t("barLabel", { number: stepIndex + 1, label: step.label })}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepCompact({ steps, currentStepIndex, summary }: StepRenderingProps) {
  const t = useTranslations("calculator.stepIndicator");
  const completedPercent =
    ((currentStepIndex + 1) / steps.length) * FULL_WIDTH_PERCENT;

  return (
    <div className="flex flex-col gap-2 md:hidden">
      <p
        aria-current="step"
        aria-label={summary}
        className="text-sm font-semibold text-lime-soft-ink"
      >
        {t("position", { current: currentStepIndex + 1, total: steps.length })}
      </p>
      <span
        aria-hidden="true"
        className="block h-1.5 overflow-hidden rounded-full bg-track"
      >
        <span
          className="block h-full animate-fill rounded-full bg-ink"
          style={{ width: `${completedPercent}%` }}
        />
      </span>
    </div>
  );
}

export default function StepIndicator({
  steps,
  currentStepIndex,
  onStepSelect,
}: StepIndicatorProps) {
  const t = useTranslations("calculator.stepIndicator");
  const summary = t("summary", {
    current: currentStepIndex + 1,
    total: steps.length,
    label: steps[currentStepIndex]?.label ?? "",
  });

  return (
    <nav aria-label={t("navigationLabel")}>
      <p className="sr-only">{summary}</p>
      <StepRail
        steps={steps}
        currentStepIndex={currentStepIndex}
        onStepSelect={onStepSelect}
      />
      <StepBars steps={steps} currentStepIndex={currentStepIndex} />
      <StepCompact
        steps={steps}
        currentStepIndex={currentStepIndex}
        summary={summary}
      />
    </nav>
  );
}
