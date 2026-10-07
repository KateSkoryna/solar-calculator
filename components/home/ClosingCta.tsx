import { useLocale, useTranslations } from "next-intl";
import { LuArrowRight } from "react-icons/lu";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import ButtonLink from "@/components/form/ButtonLink";
import AnimatedSun from "@/components/home/AnimatedSun";
import PageContainer from "@/components/layout/PageContainer";
import { calculatorPath, registerPath } from "@/lib/public-paths";

const CLOSING_TITLE_ID = "closing-title";

export default function ClosingCta() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <PageContainer
      as="section"
      labelledBy={CLOSING_TITLE_ID}
      className="py-16 md:py-20 lg:py-28"
    >
      <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[40px] bg-forest px-6 py-14 text-center md:px-12 md:py-20 lg:py-26">
        <AnimatedSun ambient />
        <Heading
          level={2}
          size="display-l"
          tone="on-dark"
          id={CLOSING_TITLE_ID}
          className="relative max-w-[860px]"
        >
          {t("closing.title")}
        </Heading>
        <Text
          size="body-l"
          tone="on-dark-muted"
          className="relative max-w-[560px]"
        >
          {t("closing.lead")}
        </Text>
        <div
          data-ball-obstacle=""
          className="relative flex w-full flex-col items-center justify-center gap-3 md:w-auto md:flex-row md:gap-4"
        >
          <ButtonLink
            href={calculatorPath(locale)}
            size="lg"
            icon={<LuArrowRight aria-hidden="true" className="size-5" />}
            className="w-full md:w-auto"
          >
            {t("cta")}
          </ButtonLink>
          <ButtonLink
            href={registerPath(locale)}
            variant="on-dark"
            size="lg"
            className="w-full md:w-auto"
          >
            {t("closing.secondaryCta")}
          </ButtonLink>
        </div>
      </div>
    </PageContainer>
  );
}
