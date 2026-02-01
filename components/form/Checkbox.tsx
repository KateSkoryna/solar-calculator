"use client";

import { useFormContext } from "react-hook-form";

interface CheckboxProps {
  name: string;
  label: string;
  className?: string;
}

export default function Checkbox({
  name,
  label,
  className = "",
}: CheckboxProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const isChecked = watch(name);
  const error = errors[name];

  const toggleCheckbox = () => {
    setValue(name, !isChecked, { shouldValidate: true });
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggleCheckbox}
        className={`w-full p-4 rounded-lg border-2 transition-all duration-300
          bg-white/10 backdrop-blur-md !flex !items-center !justify-start gap-3
          ${
            isChecked
              ? "border-[var(--accent)] bg-[var(--accent)]/20"
              : "border-white/20 hover:border-[var(--accent)]/50"
          } ${className}`}
      >
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all
            ${
              isChecked
                ? "border-[var(--accent)] bg-[var(--accent)]"
                : "border-white/20 bg-white/10 backdrop-blur-md"
            }`}
        >
          {isChecked && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium text-[var(--text-white)]">
          {label}
        </span>
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message as string}</p>
      )}
    </div>
  );
}
