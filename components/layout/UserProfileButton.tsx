"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LuLogOut, LuUser } from "react-icons/lu";
import Avatar from "@/components/common/Avatar";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { accountPath } from "@/lib/public-paths";
import { signOutToHome } from "@/lib/sign-out";

const MENU_ITEM_CLASSES = `flex w-full cursor-pointer items-center justify-start gap-2 rounded-md px-3 py-2.5 text-left text-[15px] font-semibold text-ink hover:bg-soft ${FOCUS_RING_CLASSES}`;

interface UserProfileButtonProps {
  name: string;
  imageUrl: string | null;
}

export default function UserProfileButton({
  name,
  imageUrl,
}: UserProfileButtonProps) {
  const t = useTranslations("header");
  const locale = useLocale();
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("userMenu")}
        aria-expanded={isMenuOpen}
        aria-controls={menuId}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`inline-flex cursor-pointer rounded-full ${FOCUS_RING_CLASSES}`}
      >
        <Avatar name={name} imageUrl={imageUrl} />
      </button>

      {isMenuOpen && (
        <div
          id={menuId}
          className="absolute right-0 z-50 mt-2 flex w-52 flex-col gap-1 rounded-md border border-line bg-surface p-2 shadow-hover"
        >
          <Link
            href={accountPath(locale)}
            onClick={() => setIsMenuOpen(false)}
            className={MENU_ITEM_CLASSES}
          >
            <LuUser aria-hidden="true" className="size-[18px]" />
            {t("myAccount")}
          </Link>
          <button
            type="button"
            onClick={() => signOutToHome(locale)}
            className={MENU_ITEM_CLASSES}
          >
            <LuLogOut aria-hidden="true" className="size-[18px]" />
            {t("logOut")}
          </button>
        </div>
      )}
    </div>
  );
}
