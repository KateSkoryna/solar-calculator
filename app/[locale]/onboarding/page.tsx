import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import AuthShell from "@/components/auth/AuthShell";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { loginPath } from "@/lib/public-paths";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(loginPath(locale));
  }

  const t = await getTranslations("onboarding");

  return (
    <AuthShell>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3 text-left">
          <Heading level={1} size="display-s">
            {t("title")}
          </Heading>
          <Text size="body-l" tone="muted">
            {t("intro")}
          </Text>
        </div>
        <OnboardingForm />
      </div>
    </AuthShell>
  );
}
