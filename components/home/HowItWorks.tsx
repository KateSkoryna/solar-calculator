import { useTranslations } from "next-intl";
import Heading from "@/components/common/Heading";
import NumberedStepCard from "@/components/common/NumberedStepCard";
import PageContainer from "@/components/layout/PageContainer";
import { HOW_IT_WORKS_SECTION_ID } from "@/lib/public-paths";
import {
  SCROLL_REVEAL_CLASSES,
  SCROLL_STAGGER_CLASSES,
} from "@/lib/scroll-animation";

const HOW_IT_WORKS_STEP_KEYS = ["step1", "step2", "step3", "step4"] as const;
const HOW_IT_WORKS_TITLE_ID = `${HOW_IT_WORKS_SECTION_ID}-title`;

export default function HowItWorks() {
  const t = useTranslations("home.howItWorks");

  return (
    <section
      id={HOW_IT_WORKS_SECTION_ID}
      aria-labelledby={HOW_IT_WORKS_TITLE_ID}
      className="scroll-mt-20 lg:scroll-mt-24 bg-soft"
    >
      <PageContainer className="flex flex-col gap-8 py-16 text-left md:py-20 lg:gap-10 lg:py-28">
        <Heading
          level={2}
          size="display-m"
          id={HOW_IT_WORKS_TITLE_ID}
          className={SCROLL_REVEAL_CLASSES.rise}
        >
          {t("title")}
        </Heading>
        <ol className="grid list-none gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-5">
          {HOW_IT_WORKS_STEP_KEYS.map((stepKey, stepIndex) => (
            <NumberedStepCard
              key={stepKey}
              stepNumber={stepIndex + 1}
              title={t(`${stepKey}Title`)}
              body={t(`${stepKey}Body`)}
              className={`${SCROLL_REVEAL_CLASSES.rise} ${SCROLL_STAGGER_CLASSES[stepIndex]}`}
            />
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
