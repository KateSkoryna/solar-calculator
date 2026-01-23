"use client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

export default function ClientMenu() {
  return (
    <div className="flex items-center gap-4">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}
