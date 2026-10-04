import { useLocale, useTranslations } from "next-intl";
import { LuArrowRight } from "react-icons/lu";
import Badge from "@/components/common/Badge";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import ButtonLink from "@/components/form/ButtonLink";
import ExamplePanel from "@/components/home/ExamplePanel";
import PageContainer from "@/components/layout/PageContainer";
import { calculatorPath } from "@/lib/public-paths";
import { RISE_STAGGER_CLASSES } from "@/lib/rise-animation";

export default function HomeHero() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <PageContainer
      as="section"
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
    >
      <div className="flex flex-col items-start gap-6 text-left">
        <div className={RISE_STAGGER_CLASSES[0]}>
          <Badge variant="info">{t("badge")}</Badge>
        </div>
        <Heading
          level={1}
          size="display-xl"
          className={RISE_STAGGER_CLASSES[1]}
        >
          {t("title")}
        </Heading>
        <div
          className={`flex w-full flex-col items-start gap-6 ${RISE_STAGGER_CLASSES[2]}`}
        >
          <Text size="body-l" tone="muted">
            {t("lead")}
          </Text>
          <div className="flex w-full flex-col items-start gap-3 md:w-auto md:flex-row md:items-center md:gap-4">
            <ButtonLink
              href={calculatorPath(locale)}
              size="lg"
              icon={<LuArrowRight aria-hidden="true" className="size-5" />}
              className="w-full md:w-auto"
            >
              {t("cta")}
            </ButtonLink>
            <Text size="small" tone="muted">
              {t("ctaHint")}
            </Text>
          </div>
        </div>
      </div>
      <ExamplePanel />
    </PageContainer>
  );
}
