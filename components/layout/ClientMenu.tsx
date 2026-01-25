"use client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import NavLink from "./NavLink";
import { useTranslations } from "next-intl";

export default function ClientMenu() {
  const t = useTranslations("clientmenu");

  return (
    <div className="flex items-center gap-4">
      <NavLink href="/login" className="!text-white hover:!text-[var(--accent)] focus:!text-[var(--accent)] active:!text-[var(--accent)]">
        {t("login")}
      </NavLink>
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}
