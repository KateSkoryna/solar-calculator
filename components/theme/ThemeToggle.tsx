"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("theme");

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className="p-2 rounded-lg font-bold font-[family:var(--font-inter)] transition-colors hover:opacity-80 flex items-center gap-2 bg-[var(--card)] text-[var(--text-heading)] border-2 border-[var(--border)] focus:border-[var(--accent)] focus:outline-none"
      aria-label="Toggle theme"
    >
      <Image
        src="/sun.svg"
        alt={"Sun icon"}
        width={18}
        height={18}
        className="hidden dark:block"
      />
      <Image
        src="/moon.svg"
        alt="Moon icon"
        width={18}
        height={18}
        className="block dark:hidden"
      />
    </button>
  );
}
