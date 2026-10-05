import { useId, type InputHTMLAttributes, type Ref } from "react";
import { LuCircleAlert } from "react-icons/lu";

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
      <label htmlFor={inputId} className="text-[15px] font-semibold text-ink">
        {label}
      </label>
      <input
        {...inputAttributes}
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`h-14 w-full rounded-md border bg-surface px-4 text-base text-ink placeholder:text-muted focus:shadow-ring-selected focus:outline-none ${borderClasses} ${className}`}
      />
      {hint && (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-danger"
        >
          <LuCircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
