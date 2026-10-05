import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LuCheck, LuX } from "react-icons/lu";
import Heading from "@/components/common/Heading";
import Logo from "@/components/common/Logo";
import Text from "@/components/common/Text";
import AnimatedSun from "@/components/home/AnimatedSun";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { homePath } from "@/lib/public-paths";

const BENEFIT_KEYS = ["saveCompare", "pdfReports", "inviteTeam"] as const;

interface AuthShellProps {
  children: ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
  const t = useTranslations("authShell");
  const locale = useLocale();

  return (
    <div className="grid min-h-dvh bg-ground lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-forest p-8 md:flex md:min-h-[340px] md:flex-col md:justify-between md:gap-6 lg:min-h-dvh lg:p-14">
        <AnimatedSun />
        <Link
          href={homePath(locale)}
          className={`relative w-fit rounded-full ${FOCUS_RING_CLASSES}`}
        >
          <Logo onDark />
        </Link>
        <div
          data-ball-obstacle=""
          className="relative flex max-w-[460px] flex-col gap-5"
        >
          <Heading level={2} size="display-s" tone="on-dark">
            {t("headline")}
          </Heading>
          <ul className="flex list-none flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-6 lg:flex-col">
            {BENEFIT_KEYS.map((benefitKey) => (
              <Text
                key={benefitKey}
                as="li"
                size="body"
                tone="on-dark-muted"
                className="mb-0 flex items-center gap-2.5"
              >
                <LuCheck
                  aria-hidden="true"
                  className="size-5 shrink-0 text-lime"
                />
                {t(`benefits.${benefitKey}`)}
              </Text>
            ))}
          </ul>
        </div>
        <Text
          size="small"
          tone="on-dark-muted"
          className="relative hidden lg:block"
        >
          {t("footer")}
        </Text>
      </aside>

      <div className="flex min-h-dvh flex-col md:min-h-0">
        <div className="flex items-center justify-between p-4 md:hidden">
          <Link
            href={homePath(locale)}
            className={`rounded-full ${FOCUS_RING_CLASSES}`}
          >
            <Logo />
          </Link>
          <Link
            href={homePath(locale)}
            aria-label={t("close")}
            className={`inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface text-ink hover:border-ink ${FOCUS_RING_CLASSES}`}
          >
            <LuX aria-hidden="true" className="size-5" />
          </Link>
        </div>
        <div className="flex flex-1 flex-col items-center px-4 pb-4 md:justify-center md:p-10 lg:p-14">
          <div className="flex w-full max-w-[440px] flex-1 flex-col gap-6 md:max-w-[480px] md:flex-none lg:max-w-[440px]">
            {children}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 px-4 pb-6">
          <LanguageSwitcher opensUpward />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
