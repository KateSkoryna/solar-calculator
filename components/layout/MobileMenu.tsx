"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LuMenu, LuX } from "react-icons/lu";
import Button from "@/components/form/Button";
import ButtonLink from "@/components/form/ButtonLink";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { accountPath, loginPath } from "@/lib/public-paths";
import { signOutToHome } from "@/lib/sign-out";

const DESKTOP_VIEWPORT_MEDIA_QUERY = "(min-width: 1024px)";

const ICON_BUTTON_CLASSES = `inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface text-ink hover:border-ink ${FOCUS_RING_CLASSES}`;

const MENU_LINK_CLASSES = `block rounded-md px-3 py-3 text-lg font-semibold text-ink hover:bg-soft ${FOCUS_RING_CLASSES}`;

interface MobileMenuLink {
  label: string;
  href: string;
}

interface MobileMenuProps {
  navLinks: MobileMenuLink[];
  isSignedIn: boolean;
}

export default function MobileMenu({ navLinks, isSignedIn }: MobileMenuProps) {
  const t = useTranslations("header");
  const locale = useLocale();
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => {
    dialogRef.current?.showModal();
    setIsOpen(true);
  };

  const closeMenu = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    const desktopViewport = window.matchMedia(DESKTOP_VIEWPORT_MEDIA_QUERY);
    const closeWhenDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        dialogRef.current?.close();
      }
    };
    desktopViewport.addEventListener("change", closeWhenDesktop);
    return () =>
      desktopViewport.removeEventListener("change", closeWhenDesktop);
  }, []);

  const handleDialogClosed = () => {
    setIsOpen(false);
    openButtonRef.current?.focus();
  };

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        aria-label={t("openMenu")}
        aria-expanded={isOpen}
        aria-controls={dialogId}
        onClick={openMenu}
        className={`lg:hidden ${ICON_BUTTON_CLASSES}`}
      >
        <LuMenu aria-hidden="true" className="size-5" />
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label={t("menuTitle")}
        onClose={handleDialogClosed}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        className="m-0 ml-auto h-dvh max-h-dvh w-[min(22rem,100vw)] max-w-none bg-ground p-6 text-ink backdrop:bg-ink/40 open:flex open:animate-step-in open:flex-col open:gap-6"
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold">{t("menuTitle")}</p>
          <button
            type="button"
            aria-label={t("closeMenu")}
            onClick={closeMenu}
            className={ICON_BUTTON_CLASSES}
          >
            <LuX aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav aria-label={t("mainNavigation")}>
          <ul className="flex flex-col gap-1">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMenu}
                  className={MENU_LINK_CLASSES}
                >
                  {label}
                </Link>
              </li>
            ))}
            {isSignedIn && (
              <li>
                <Link
                  href={accountPath(locale)}
                  onClick={closeMenu}
                  className={MENU_LINK_CLASSES}
                >
                  {t("myAccount")}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {isSignedIn ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => signOutToHome(locale)}
          >
            {t("logOut")}
          </Button>
        ) : (
          <ButtonLink
            href={loginPath(locale)}
            variant="dark"
            fullWidth
            onClick={closeMenu}
          >
            {t("logIn")}
          </ButtonLink>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
          <LanguageSwitcher opensUpward />
          <ThemeToggle />
        </div>
      </dialog>
    </>
  );
}
