"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { LuMoon, LuSun } from "react-icons/lu";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";

const LIGHT_THEME = "light";
const DARK_THEME = "dark";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("theme");

  return (
    <button
      type="button"
      onClick={() =>
        setTheme(resolvedTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME)
      }
      aria-label={t("toggleAriaLabel")}
      className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface text-ink hover:border-ink ${FOCUS_RING_CLASSES}`}
    >
      <LuSun aria-hidden="true" className="hidden size-5 dark:block" />
      <LuMoon aria-hidden="true" className="block size-5 dark:hidden" />
    </button>
  );
}
