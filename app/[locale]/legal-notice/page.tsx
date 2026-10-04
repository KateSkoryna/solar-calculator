import { useTranslations } from "next-intl";
import LegalDocument from "@/components/legal/LegalDocument";
import { SITE_OWNER_EMAIL, SITE_OWNER_NAME } from "@/lib/site-owner";

const LEGAL_NOTICE_SECTION_KEYS = [
  "operator",
  "contact",
  "purpose",
  "liability",
] as const;

export default function LegalNoticePage() {
  const t = useTranslations("legalNoticePage");
  const sections = LEGAL_NOTICE_SECTION_KEYS.map((sectionKey) => ({
    title: t(`sections.${sectionKey}.title`),
    body: t(`sections.${sectionKey}.body`, {
      name: SITE_OWNER_NAME,
      email: SITE_OWNER_EMAIL,
    }),
  }));

  return (
    <LegalDocument title={t("title")} intro={t("intro")} sections={sections} />
  );
}
