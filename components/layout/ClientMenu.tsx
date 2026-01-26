"use client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import NavLink from "./NavLink";
import { useTranslations } from "next-intl";

export default function ClientMenu() {
  const t = useTranslations("clientmenu");

  return (
    <div className="flex items-center gap-4">
      <NavLink
        href="/login"
        className="invert-link"
        noHover
      >
        {t("login")}
      </NavLink>
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}
