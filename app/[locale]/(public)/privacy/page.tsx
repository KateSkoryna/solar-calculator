import { useTranslations } from "next-intl";
import LegalDocument from "@/components/legal/LegalDocument";
import { SITE_OWNER_EMAIL } from "@/lib/site-owner";

const PRIVACY_SECTION_KEYS = [
  "calculator",
  "account",
  "fleet",
  "email",
  "cookies",
  "technical",
  "retention",
  "rights",
] as const;

export default function PrivacyPage() {
  const t = useTranslations("privacyPage");
  const sections = PRIVACY_SECTION_KEYS.map((sectionKey) => ({
    title: t(`sections.${sectionKey}.title`),
    body: t(`sections.${sectionKey}.body`, { email: SITE_OWNER_EMAIL }),
  }));

  return (
    <LegalDocument title={t("title")} intro={t("intro")} sections={sections} />
  );
}
