"use client";

import { useFormContext } from "react-hook-form";
import { useState, useRef, useEffect } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  name: string;
  label: string;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
}

export default function Dropdown({
  name,
  label,
  options,
  placeholder,
  className = "",
}: DropdownProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const selectedValue = watch(name);

  const error = errors[name];

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (value: string) => {
    setValue(name, value, { shouldValidate: true });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-white)] mb-2">
        {label}
      </label>
      <details
        ref={detailsRef}
        open={isOpen}
        onToggle={(e) => setIsOpen(e.currentTarget.open)}
        className={`relative ${className}`}
      >
        <summary
          className={`w-full p-3 rounded-md border-2 border-white/20 list-none cursor-pointer
            bg-white/10 backdrop-blur-md text-[var(--text-white)]
            focus:outline-none focus:border-[var(--accent)] transition-colors
            flex justify-between items-center ${!selectedValue ? "opacity-60" : ""}`}
        >
          <span>{displayText}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div
          className="absolute z-500 top-[105%] left-[80%] w-fit bg-white/20 backdrop-blur-md border-2 border-white/20 rounded-md shadow-lg
            max-h-60 overflow-auto text-left"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full !justify-start text-left px-3 py-2 hover:bg-[var(--accent)]/10
                transition-colors whitespace-nowrap ${
                  selectedValue === option.value
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "text-[var(--text-white)]"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </details>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message as string}</p>
      )}
    </div>
  );
}
