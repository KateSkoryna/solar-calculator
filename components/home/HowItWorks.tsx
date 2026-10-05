import { useTranslations } from "next-intl";
import Heading from "@/components/common/Heading";
import NumberedStepCard from "@/components/common/NumberedStepCard";
import PageContainer from "@/components/layout/PageContainer";
import { HOW_IT_WORKS_SECTION_ID } from "@/lib/public-paths";

const HOW_IT_WORKS_STEP_KEYS = ["step1", "step2", "step3"] as const;
const HOW_IT_WORKS_TITLE_ID = `${HOW_IT_WORKS_SECTION_ID}-title`;

export default function HowItWorks() {
  const t = useTranslations("home.howItWorks");

  return (
    <PageContainer
      as="section"
      id={HOW_IT_WORKS_SECTION_ID}
      labelledBy={HOW_IT_WORKS_TITLE_ID}
      className="flex scroll-mt-6 flex-col gap-6 text-left"
    >
      <Heading level={2} size="display-s" id={HOW_IT_WORKS_TITLE_ID}>
        {t("title")}
      </Heading>
      <ol className="grid list-none gap-3 md:gap-4 lg:grid-cols-3 lg:gap-6">
        {HOW_IT_WORKS_STEP_KEYS.map((stepKey, stepIndex) => (
          <NumberedStepCard
            key={stepKey}
            stepNumber={stepIndex + 1}
            title={t(`${stepKey}Title`)}
            body={t(`${stepKey}Body`)}
          />
        ))}
      </ol>
    </PageContainer>
  );
}
