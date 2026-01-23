"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("theme");

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="
    p-2
    rounded-lg
    font-bold
    font-[family:var(--font-inter)]
    transition-colors
    hover:opacity-80
    flex items-center gap-2
    bg-[color:var(--card)]
    text-[color:var(--text-heading)]
    border-2 border-[color:var(--border)]
  "
      aria-label="Toggle theme"
    >
      <Image
        src={theme === "light" ? "/moon.svg" : "/sun.svg"}
        alt={theme === "light" ? "Moon icon" : "Sun icon"}
        width={18}
        height={18}
      />
    </button>
  );
}
