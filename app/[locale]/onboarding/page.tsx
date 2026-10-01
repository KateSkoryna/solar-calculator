import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import Section from "@/components/layout/Section";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("onboarding");

  return (
    <Section>
      <div className="mx-auto max-w-md">
        <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md">
          <h3 className="!text-[var(--accent)] text-center mb-6">
            {t("title")}
          </h3>
          <OnboardingForm />
        </div>
      </div>
    </Section>
  );
}
