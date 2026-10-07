import { useTranslations } from "next-intl";
import { LuLink } from "react-icons/lu";
import Text from "@/components/common/Text";
import SectionIntro from "@/components/home/SectionIntro";
import FloatingCard from "@/components/home/showcase/FloatingCard";
import ResultScreen from "@/components/home/showcase/ResultScreen";
import PageContainer from "@/components/layout/PageContainer";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import { getHomeShowcase } from "@/lib/home-showcase";
import { PRODUCT_SECTION_ID } from "@/lib/public-paths";
import {
  SCROLL_REVEAL_CLASSES,
  SCROLL_STAGGER_CLASSES,
} from "@/lib/scroll-animation";

const PRODUCT_TITLE_ID = `${PRODUCT_SECTION_ID}-title`;

export default function ResultShowcase() {
  const t = useTranslations();
  const { duration } = useResultsFormatters();
  const { range } = getHomeShowcase().result.verdict;

  return (
    <section
      id={PRODUCT_SECTION_ID}
      aria-labelledby={PRODUCT_TITLE_ID}
      className="scroll-mt-20 lg:scroll-mt-24 overflow-x-clip bg-forest"
    >
      <PageContainer className="flex flex-col items-center gap-10 py-16 md:py-20 lg:gap-12 lg:py-28">
        <SectionIntro
          eyebrow={t("home.result.eyebrow")}
          title={t("home.result.title")}
          titleId={PRODUCT_TITLE_ID}
          lead={t("home.result.lead")}
          onDark
          centered
        />
        <div className="relative w-full max-w-[1080px]">
          <ResultScreen />
          {range?.longest && (
            <FloatingCard
              className={`top-[63%] -left-8 max-w-56 ${SCROLL_REVEAL_CLASSES.fromLeft} ${SCROLL_STAGGER_CLASSES[2]}`}
            >
              <span className="flex flex-col gap-1.5">
                <Text
                  as="span"
                  size="caption"
                  tone="muted"
                  className="font-semibold"
                >
                  {t("home.result.rangeTitle")}
                </Text>
                <span className="text-sm">
                  {t("results.chart.legend.PESSIMISTIC")}{" "}
                  <span className="font-semibold">
                    {duration(range.longest)}
                  </span>
                </span>
                <span className="text-sm">
                  {t("results.chart.legend.OPTIMISTIC")}{" "}
                  <span className="font-semibold">
                    {duration(range.shortest)}
                  </span>
                </span>
              </span>
            </FloatingCard>
          )}
          <FloatingCard
            tone="lime"
            className={`top-[calc(23%-16px)] -right-8 max-w-60 ${SCROLL_REVEAL_CLASSES.fromRight} ${SCROLL_STAGGER_CLASSES[3]}`}
          >
            <span className="flex items-center gap-2.5">
              <LuLink aria-hidden="true" className="size-5 shrink-0" />
              <span className="text-sm font-semibold">
                {t("home.result.share")}
              </span>
            </span>
          </FloatingCard>
        </div>
      </PageContainer>
    </section>
  );
}
