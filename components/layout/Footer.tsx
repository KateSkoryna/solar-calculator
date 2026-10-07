import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { LuArrowUp } from "react-icons/lu";
import { legalNoticePath, PAGE_TOP_ID, privacyPath } from "@/lib/public-paths";
import PageContainer from "./PageContainer";

const FOOTER_LINK_CLASSES = `rounded-sm font-normal text-muted underline-offset-4 hover:text-ink hover:underline ${FOCUS_RING_CLASSES}`;

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();
  const legalLinks = [
    { label: t("privacy"), href: privacyPath(locale) },
    { label: t("legalNotice"), href: legalNoticePath(locale) },
  ];

  return (
    <footer className="border-t border-line bg-ground">
      <PageContainer className="flex flex-col items-center gap-3 py-6 text-center text-sm text-muted md:flex-row md:justify-between md:text-left">
        <p>{t("copyright", { currentYear })}</p>
        <nav aria-label={t("legalNavigation")}>
          <ul className="flex list-none flex-wrap justify-center gap-x-8 gap-y-2 md:justify-start">
            {legalLinks.map(({ label, href }) => (
              <li key={href} className="text-muted">
                <Link href={href} className={FOOTER_LINK_CLASSES}>
                  {label}
                </Link>
              </li>
            ))}
            <li className="text-muted">
              <a
                href={`#${PAGE_TOP_ID}`}
                className={`inline-flex items-center gap-1.5 ${FOOTER_LINK_CLASSES}`}
              >
                {t("backToTop")}
                <LuArrowUp aria-hidden="true" className="size-4" />
              </a>
            </li>
          </ul>
        </nav>
      </PageContainer>
    </footer>
  );
}
