"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import DropdownChevron from "@/components/common/DropdownChevron";
import { locales, type Locale } from "@/i18n";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";

const LOCALE_PREFIX_PATTERN = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

interface LanguageSwitcherProps {
  opensUpward?: boolean;
}

export default function LanguageSwitcher({
  opensUpward = false,
}: LanguageSwitcherProps) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const menuPositionClasses = opensUpward
    ? "bottom-[calc(100%+6px)] left-0"
    : "top-[calc(100%+6px)] right-0";

  const switchLocale = (newLocale: Locale) => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
    const pathnameWithoutLocale = (pathname ?? "").replace(
      LOCALE_PREFIX_PATTERN,
      "",
    );
    router.push(`/${newLocale}${pathnameWithoutLocale}`);
  };

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        aria-label={t("switcherLabel")}
        className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line-strong bg-surface pl-4 pr-3 text-sm font-semibold text-ink hover:border-ink [&::-webkit-details-marker]:hidden ${FOCUS_RING_CLASSES}`}
      >
        {currentLocale.toUpperCase()}
        <DropdownChevron />
      </summary>

      <ul
        className={`absolute z-50 flex min-w-40 list-none flex-col gap-1 rounded-md border border-line bg-surface p-2 shadow-hover ${menuPositionClasses}`}
      >
        {locales.map((locale) => (
          <li key={locale} className="mb-0">
            <button
              type="button"
              lang={locale}
              aria-current={currentLocale === locale ? "true" : undefined}
              onClick={() => switchLocale(locale)}
              className={`w-full justify-start rounded-sm px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-soft aria-[current]:bg-soft ${FOCUS_RING_CLASSES}`}
            >
              {t(locale)}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
