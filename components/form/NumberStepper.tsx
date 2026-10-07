"use client";

import { useId, useState } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";
import FieldError from "@/components/form/FieldError";
import FieldHint from "@/components/form/FieldHint";
import FieldLabel from "@/components/form/FieldLabel";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";

export const DEFAULT_STEPPER_MINIMUM = 1;
export const DEFAULT_STEPPER_MAXIMUM = 999;

const WHOLE_NUMBER_PATTERN = /^\d+$/;
const SUBMIT_KEY = "Enter";

const STEPPER_BUTTON_CLASSES = `inline-flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-md border border-line-strong bg-surface text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line-strong ${FOCUS_RING_CLASSES}`;

interface NumberStepperProps {
  label: string;
  hint?: string;
  value: number;
  minimum?: number;
  maximum?: number;
  decreaseLabel: string;
  increaseLabel: string;
  rangeErrorMessage: string;
  onChange: (value: number) => void;
}

export default function NumberStepper({
  label,
  hint,
  value,
  minimum = DEFAULT_STEPPER_MINIMUM,
  maximum = DEFAULT_STEPPER_MAXIMUM,
  decreaseLabel,
  increaseLabel,
  rangeErrorMessage,
  onChange,
}: NumberStepperProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const [draft, setDraft] = useState(String(value));
  const [committedValue, setCommittedValue] = useState(value);

  if (!Object.is(value, committedValue)) {
    setCommittedValue(value);
    setDraft(String(value));
  }

  const isWithinRange = (candidate: number) =>
    candidate >= minimum && candidate <= maximum;
  const isDraftValid =
    WHOLE_NUMBER_PATTERN.test(draft) && isWithinRange(Number(draft));
  const describedBy =
    [hint ? hintId : "", isDraftValid ? "" : errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  const commit = (nextValue: number) => {
    setDraft(String(nextValue));
    setCommittedValue(nextValue);
    onChange(nextValue);
  };

  const handleTyping = (typedText: string) => {
    setDraft(typedText);
    if (WHOLE_NUMBER_PATTERN.test(typedText)) {
      const typedNumber = Number(typedText);
      if (isWithinRange(typedNumber)) {
        setCommittedValue(typedNumber);
        onChange(typedNumber);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 text-left">
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label={decreaseLabel}
          disabled={value <= minimum}
          onClick={() => commit(value - 1)}
          className={STEPPER_BUTTON_CLASSES}
        >
          <LuMinus aria-hidden="true" className="size-5" />
        </button>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={draft}
          aria-invalid={isDraftValid ? undefined : "true"}
          aria-describedby={describedBy}
          onChange={(event) => handleTyping(event.target.value)}
          onBlur={() => setDraft(String(committedValue))}
          onKeyDown={(event) => {
            if (event.key === SUBMIT_KEY && !isDraftValid) {
              event.preventDefault();
            }
          }}
          className="h-14 w-full min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3 text-center text-[22px] font-semibold text-ink tabular-nums focus:border-ink focus:shadow-ring-selected focus:outline-none aria-[invalid]:border-danger md:w-28 md:flex-none"
        />
        <button
          type="button"
          aria-label={increaseLabel}
          disabled={value >= maximum}
          onClick={() => commit(value + 1)}
          className={STEPPER_BUTTON_CLASSES}
        >
          <LuPlus aria-hidden="true" className="size-5" />
        </button>
      </div>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      {!isDraftValid && (
        <FieldError id={errorId} announce>
          {rangeErrorMessage}
        </FieldError>
      )}
    </div>
  );
}
