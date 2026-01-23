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
    <details
      ref={detailsRef}
      className="relative"
      style={{
        cursor: "pointer",
      }}
    >
      <summary
        className="px-4 py-2 rounded-xl font-bold font-[family:var(--font-inter)] transition-colors text-sm list-none flex items-center gap-2"
        style={{
          background: "var(--card)",
          color: "var(--text-heading)",
          border: "2px solid var(--border)",
        }}
      >
        <span>{currentLocale.toUpperCase()}</span>
        <span className="text-xs">▼</span>
      </summary>
      <ul
        className="absolute top-full mt-2 rounded-xl overflow-hidden min-w-full"
        style={{
          background: "var(--card)",
          border: "2px solid var(--border)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {locales.map((loc) => (
          <li key={loc}>
            <button
              onClick={() => handleLocaleChange(loc)}
              className="w-full px-4 py-2 font-bold font-[family:var(--font-inter)] transition-colors text-sm text-left hover:opacity-80"
              style={{
                background: currentLocale === loc ? "var(--primary)" : "var(--card)",
                color: currentLocale === loc ? "var(--text-on-primary)" : "var(--text-body)",
              }}
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
