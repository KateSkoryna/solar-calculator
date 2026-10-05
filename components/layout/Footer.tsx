import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { legalNoticePath, privacyPath } from "@/lib/public-paths";
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
      <PageContainer className="flex flex-col gap-3 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>{t("copyright", { currentYear })}</p>
        <nav aria-label={t("legalNavigation")}>
          <ul className="flex list-none flex-wrap gap-x-8 gap-y-2">
            {legalLinks.map(({ label, href }) => (
              <li key={href} className="mb-0 text-muted">
                <Link href={href} className={FOOTER_LINK_CLASSES}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageContainer>
    </footer>
  );
}
