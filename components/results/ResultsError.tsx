import { useLocale, useTranslations } from "next-intl";
import Card from "@/components/common/Card";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import ButtonLink from "@/components/form/ButtonLink";
import PageContainer from "@/components/layout/PageContainer";
import { calculatorPath } from "@/lib/public-paths";

export default function ResultsError() {
  const t = useTranslations("results.error");
  const locale = useLocale();

  return (
    <PageContainer className="py-10 md:py-16">
      <Card className="mx-auto flex max-w-[640px] flex-col items-start gap-4 text-left">
        <Heading level={1} size="display-s">
          {t("title")}
        </Heading>
        <Text tone="muted">{t("text")}</Text>
        <ButtonLink href={calculatorPath(locale)}>{t("action")}</ButtonLink>
      </Card>
    </PageContainer>
  );
}
