import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Section from "@/components/layout/Section";

export default async function CheckEmailPage() {
  const t = await getTranslations("checkEmail");

  return (
    <Section>
      <div className="mx-auto max-w-md">
        <div className="bg-surface p-8 rounded-lg shadow-md">
          <h3 className="!text-lime-soft-ink text-center mb-4">{t("title")}</h3>
          <p className="text-center text-ink mb-6">{t("message")}</p>
          <div className="text-center">
            <Link href="/login" className="text-lime-soft-ink hover:underline">
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
