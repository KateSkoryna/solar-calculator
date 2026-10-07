import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { auth } from "@/auth";
import Logo from "@/components/common/Logo";
import ButtonLink from "@/components/form/ButtonLink";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import {
  buildPublicNavItems,
  PUBLIC_NAV_MESSAGE_NAMESPACE,
} from "@/lib/public-nav";
import { homePath, loginPath } from "@/lib/public-paths";
import MobileMenu from "./MobileMenu";
import PageContainer from "./PageContainer";
import UserProfileButton from "./UserProfileButton";

export interface HeaderUser {
  name: string;
  imageUrl: string | null;
}

interface HeaderBarProps {
  user: HeaderUser | null;
}

function HeaderBar({ user }: HeaderBarProps) {
  const t = useTranslations(PUBLIC_NAV_MESSAGE_NAMESPACE);
  const locale = useLocale();
  const isSignedIn = user !== null;
  const navLinks = buildPublicNavItems(locale, isSignedIn).map(
    ({ messageKey, href }) => ({ label: t(messageKey), href }),
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ground">
      <PageContainer className="flex min-h-[72px] items-center justify-between gap-4 lg:min-h-20">
        <Link
          href={homePath(locale)}
          className={`rounded-full ${FOCUS_RING_CLASSES}`}
        >
          <Logo />
        </Link>

        <nav aria-label={t("mainNavigation")} className="hidden lg:block">
          <ul className="flex items-center gap-4 xl:gap-8">
            {navLinks.map(({ label, href }) => (
              <li key={href} className="mb-0">
                <Link
                  href={href}
                  className={`rounded-sm text-[13px] font-semibold whitespace-nowrap text-ink xl:text-[15px] hover:text-lime-soft-ink ${FOCUS_RING_CLASSES}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {user ? (
            <div className="hidden lg:block">
              <UserProfileButton name={user.name} imageUrl={user.imageUrl} />
            </div>
          ) : (
            <div className="hidden md:block">
              <ButtonLink href={loginPath(locale)} variant="dark" size="sm">
                {t("logIn")}
              </ButtonLink>
            </div>
          )}
          <MobileMenu navLinks={navLinks} isSignedIn={isSignedIn} />
        </div>
      </PageContainer>
    </header>
  );
}

export default async function Header() {
  const session = await auth();
  const sessionUser = session?.user;
  const user: HeaderUser | null = sessionUser
    ? {
        name: sessionUser.name ?? sessionUser.email ?? "",
        imageUrl: sessionUser.image ?? null,
      }
    : null;

  return <HeaderBar user={user} />;
}
