"use client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import NavLink from "./NavLink";
import { useTranslations } from "next-intl";
import { Session } from "next-auth";
import UserProfileButton from "./UserProfileButton";

export default function ClientMenu({ session }: { session: Session | null }) {
  const t = useTranslations("clientmenu");

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {!session ? (
        <NavLink href="/login" className="invert-link" noHover>
          {t("login")}
        </NavLink>
      ) : (
        <UserProfileButton />
      )}
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}
