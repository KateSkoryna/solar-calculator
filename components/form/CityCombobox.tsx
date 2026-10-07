"use client";

import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import FieldError from "@/components/form/FieldError";
import FieldHint from "@/components/form/FieldHint";
import FieldLabel from "@/components/form/FieldLabel";
import type { CalculatorCity } from "@/lib/calculator-form";
import type { CityResult } from "@/lib/geocode";
import {
  CITY_SEARCH_DEBOUNCE_MS,
  fetchCities,
  MIN_CITY_SEARCH_LENGTH,
} from "@/lib/geocode-client";

type SearchStatus = "idle" | "loading" | "ready" | "failed";

const NO_ACTIVE_OPTION = -1;

interface CityComboboxProps {
  label: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  value: CalculatorCity | null;
  inputRef?: Ref<HTMLInputElement>;
  onChange: (city: CalculatorCity | null) => void;
  onBlur?: () => void;
}

export default function CityCombobox({
  label,
  placeholder,
  hint,
  error,
  value,
  inputRef,
  onChange,
  onBlur,
}: CityComboboxProps) {
  const t = useTranslations("calculator.city");
  const locale = useLocale();
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const statusId = `${inputId}-status`;
  const selectedLabel = value?.label ?? "";
  const [query, setQuery] = useState(selectedLabel);
  const [syncedLabel, setSyncedLabel] = useState(selectedLabel);
  const [cities, setCities] = useState<CityResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(NO_ACTIVE_OPTION);

  if (selectedLabel !== syncedLabel) {
    setSyncedLabel(selectedLabel);
    if (selectedLabel !== "") {
      setQuery(selectedLabel);
    }
  }

  const trimmedQuery = query.trim();
  const shouldSearch =
    isOpen &&
    trimmedQuery.length >= MIN_CITY_SEARCH_LENGTH &&
    trimmedQuery !== selectedLabel;

  useEffect(() => {
    if (!shouldSearch) return;

    const abortController = new AbortController();
    const debounceTimer = setTimeout(() => {
      setSearchStatus("loading");
      fetchCities(trimmedQuery, locale, abortController.signal)
        .then((foundCities) => {
          setCities(foundCities);
          setActiveIndex(NO_ACTIVE_OPTION);
          setSearchStatus("ready");
        })
        .catch(() => {
          if (abortController.signal.aborted) return;
          setCities([]);
          setSearchStatus("failed");
        });
    }, CITY_SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceTimer);
      abortController.abort();
    };
  }, [shouldSearch, trimmedQuery, locale]);

  const visibleCities = shouldSearch && searchStatus === "ready" ? cities : [];
  const isListVisible = visibleCities.length > 0;
  const statusMessage = !shouldSearch
    ? ""
    : searchStatus === "loading"
      ? t("loading")
      : searchStatus === "failed"
        ? t("unavailable")
        : searchStatus === "ready" && cities.length === 0
          ? t("noResults")
          : "";
  const describedBy =
    [hint ? hintId : "", error ? errorId : "", statusId]
      .filter(Boolean)
      .join(" ") || undefined;

  const selectCity = (city: CityResult) => {
    onChange({
      label: city.label,
      countryCode: city.countryCode,
      latitude: city.latitude,
      longitude: city.longitude,
    });
    setQuery(city.label);
    setSyncedLabel(city.label);
    setIsOpen(false);
    setActiveIndex(NO_ACTIVE_OPTION);
  };

  const handleTyping = (typedText: string) => {
    setQuery(typedText);
    setCities([]);
    setSearchStatus("idle");
    setActiveIndex(NO_ACTIVE_OPTION);
    setIsOpen(true);
    if (value !== null) {
      onChange(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isListVisible) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((activeIndex + 1) % visibleCities.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        activeIndex <= 0 ? visibleCities.length - 1 : activeIndex - 1,
      );
    } else if (event.key === "Enter" && activeIndex !== NO_ACTIVE_OPTION) {
      event.preventDefault();
      selectCity(visibleCities[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-left">
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          aria-expanded={isListVisible}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            isListVisible && activeIndex !== NO_ACTIVE_OPTION
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          onChange={(event) => handleTyping(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setIsOpen(false);
            onBlur?.();
          }}
          className="h-14 w-full rounded-md border border-line-strong bg-surface px-4 text-base text-ink placeholder:text-muted focus:border-ink focus:shadow-ring-selected focus:outline-none aria-[invalid]:border-danger"
        />
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          hidden={!isListVisible}
          className="absolute top-full right-0 left-0 z-10 mt-2 flex list-none flex-col gap-1 rounded-md border border-line bg-surface p-2 shadow-hover"
        >
          {visibleCities.map((city, cityIndex) => (
            <li
              key={city.label}
              id={`${listboxId}-option-${cityIndex}`}
              role="option"
              aria-selected={cityIndex === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                selectCity(city);
              }}
              className="flex cursor-pointer flex-col rounded-sm px-3 py-2 hover:bg-soft aria-selected:bg-soft"
            >
              <span className="text-base font-semibold text-ink">
                {city.name}
              </span>
              <span className="text-[13px] text-muted">{city.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      <p
        id={statusId}
        aria-live="polite"
        className="text-[13px] text-muted empty:hidden"
      >
        {statusMessage}
      </p>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
