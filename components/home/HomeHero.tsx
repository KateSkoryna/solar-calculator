import { useLocale, useTranslations } from "next-intl";
import { LuArrowDown, LuArrowRight, LuTrendingUp } from "react-icons/lu";
import Badge from "@/components/common/Badge";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import ButtonLink from "@/components/form/ButtonLink";
import AnimatedSun from "@/components/home/AnimatedSun";
import DashboardScreen from "@/components/home/showcase/DashboardScreen";
import FloatingCard from "@/components/home/showcase/FloatingCard";
import PageContainer from "@/components/layout/PageContainer";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import { getHomeShowcase } from "@/lib/home-showcase";
import { calculatorPath, productPath } from "@/lib/public-paths";
import { RISE_STAGGER_CLASSES } from "@/lib/rise-animation";

export default function HomeHero() {
  const t = useTranslations();
  const locale = useLocale();
  const { duration, tonnes } = useResultsFormatters();
  const { verdict, tiles } = getHomeShowcase().result;

  return (
    <section className="relative overflow-hidden bg-forest">
      <AnimatedSun />
      <PageContainer className="relative flex flex-col items-center gap-7 pt-12 text-center md:pt-20 lg:pt-24">
        <div className={RISE_STAGGER_CLASSES[0]}>
          <Badge variant="on-dark">{t("home.badge")}</Badge>
        </div>
        <Heading
          level={1}
          size="display-xl"
          tone="on-dark"
          className={`max-w-[1040px] ${RISE_STAGGER_CLASSES[1]}`}
        >
          {t.rich("home.title", {
            highlight: (highlighted) => (
              <span className="text-lime">{highlighted}</span>
            ),
          })}
        </Heading>
        <div
          className={`flex w-full flex-col items-center gap-7 ${RISE_STAGGER_CLASSES[2]}`}
        >
          <Text size="body-l" tone="on-dark-muted" className="max-w-[680px]">
            {t("home.lead")}
          </Text>
          <div className="flex w-full flex-col items-center justify-center gap-3 md:w-auto md:flex-row md:gap-4">
            <ButtonLink
              href={calculatorPath(locale)}
              size="lg"
              icon={<LuArrowRight aria-hidden="true" className="size-5" />}
              className="w-full md:w-auto"
            >
              {t("home.cta")}
            </ButtonLink>
            <ButtonLink
              href={productPath(locale)}
              variant="on-dark"
              size="lg"
              icon={<LuArrowDown aria-hidden="true" className="size-5" />}
              className="w-full md:w-auto"
            >
              {t("home.secondaryCta")}
            </ButtonLink>
          </div>
        </div>
        <div
          data-ball-obstacle=""
          className={`relative mt-5 w-full max-w-[1120px] ${RISE_STAGGER_CLASSES[2]}`}
        >
          <DashboardScreen />
          {verdict.duration && (
            <FloatingCard className="bottom-[8%] -left-8 animate-float">
              <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-lime-soft text-lime-soft-ink">
                  <LuTrendingUp aria-hidden="true" className="size-5" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <Text as="span" size="caption" tone="muted">
                    {t("overview.groups.columns.paysOffIn")} ·{" "}
                    {t("home.sampleData")}
                  </Text>
                  <span className="font-display text-xl font-extrabold">
                    {duration(verdict.duration)}
                  </span>
                </span>
              </span>
            </FloatingCard>
          )}
          <FloatingCard
            tone="lime"
            className="top-[calc(52%-16px)] -right-8 animate-float [animation-delay:-3.5s]"
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold">
                {t("results.tiles.co2Avoided")} · {t("home.sampleData")}
              </span>
              <span className="font-display text-[22px] font-extrabold">
                {tonnes(tiles.co2AvoidedTonnes.realistic)}
              </span>
            </span>
          </FloatingCard>
        </div>
      </PageContainer>
    </section>
  );
}
