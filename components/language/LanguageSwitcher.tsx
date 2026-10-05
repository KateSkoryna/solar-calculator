"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import { useRef } from "react";

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const handleLocaleChange = (newLocale: Locale) => {
    // Close the dropdown
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }

    // Remove current locale from pathname if it exists
    const pathnameWithoutLocale = pathname.replace(/^\/(en|de|es)/, "");

    // Build new path with locale prefix
    const newPath = `/${newLocale}${pathnameWithoutLocale || ""}`;

    router.push(newPath);
  };

  return (
    <details ref={detailsRef} className="relative cursor-pointer">
      <summary className="px-4 py-2 rounded-lg font-bold font-body text-sm flex items-center gap-2 transition-colors bg-surface text-ink list-none border-2 border-line-strong focus:border-lime focus:outline-none">
        <span>{currentLocale.toUpperCase()}</span>
        <span className="text-xs">▼</span>
      </summary>

      <ul className="absolute top-[calc(100%+2px)] z-50 rounded-lg overflow-hidden min-w-full bg-surface border-2 border-line-strong shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
        {locales.map((loc) => (
          <li key={loc}>
            <button
              onClick={() => handleLocaleChange(loc)}
              className={`w-full px-4 py-2 font-bold font-body text-sm text-left transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-lime ${
                currentLocale === loc
                  ? "bg-soft text-ink"
                  : "bg-surface text-ink"
              }`}
              aria-label={`Switch to ${t(loc)}`}
            >
              {t(loc)}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
