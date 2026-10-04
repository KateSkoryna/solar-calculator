import { useId, type InputHTMLAttributes, type Ref } from "react";
import FieldError from "@/components/form/FieldError";
import FieldHint from "@/components/form/FieldHint";
import FieldLabel from "@/components/form/FieldLabel";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export default function Input({
  label,
  hint,
  error,
  id,
  className = "",
  ref,
  "aria-describedby": externalDescriptionId,
  ...inputAttributes
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [externalDescriptionId, hint ? hintId : "", error ? errorId : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  const borderClasses = error
    ? "border-danger"
    : "border-line-strong focus:border-ink";

  return (
    <div className="flex flex-col gap-2 text-left">
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <input
        {...inputAttributes}
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`h-14 w-full rounded-md border bg-surface px-4 text-base text-ink placeholder:text-muted focus:shadow-ring-selected focus:outline-none ${borderClasses} ${className}`}
      />
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
