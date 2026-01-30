import { useTranslations } from "next-intl";
import PageTitle from "@/components/common/PageTitle";
import Section from "@/components/layout/Section";
import MultiStepForm from "@/components/calculator/MultiStepForm";

export default function Calculator() {
  const t = useTranslations("calculator");

  return (
    <Section className="text-left">
      <PageTitle>{t("title")}</PageTitle>

      <p className="text-center text-lg text-[var(--text-white)] mb-6">
        {t("subtitle")}
      </p>

      <div className="w-full mx-auto md:w-3/4 lg:w-1/2 bg-[var(--form-bg)] p-6 rounded-lg shadow-md">
        <MultiStepForm />
      </div>
    </Section>
  );
}
