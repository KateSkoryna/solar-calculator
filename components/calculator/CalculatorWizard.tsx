"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { LuLock } from "react-icons/lu";
import AnswersPanel from "@/components/calculator/AnswersPanel";
import CalculatorActions from "@/components/calculator/CalculatorActions";
import StepIndicator from "@/components/calculator/StepIndicator";
import DailyDrivingStep from "@/components/calculator/steps/DailyDrivingStep";
import LocationStep from "@/components/calculator/steps/LocationStep";
import PanelsStep from "@/components/calculator/steps/PanelsStep";
import VehiclesStep from "@/components/calculator/steps/VehiclesStep";
import { useCalculatorAnswers } from "@/components/calculator/useCalculatorAnswers";
import { useCalculatorSteps } from "@/components/calculator/useCalculatorOptions";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import PageContainer from "@/components/layout/PageContainer";
import {
  CALCULATOR_DEFAULT_VALUES,
  CALCULATOR_STEP_FIELDS,
  CALCULATOR_STEP_KEYS,
  calculatorFormSchema,
  calculatorInputSources,
  toQuickCheckAnswers,
  type CalculatorFormValues,
} from "@/lib/calculator-form";
import { CALCULATOR_QUESTION_ID } from "@/lib/calculator-question";
import {
  readCalculatorAnswers,
  saveCalculatorAnswers,
} from "@/lib/calculator-storage";
import { estimateAccuracy } from "@/lib/estimate-accuracy";
import { resultsPath } from "@/lib/public-paths";
import { encodeQuickCheck } from "@/lib/quick-check-mapping";

const FIRST_STEP_INDEX = 0;
const LAST_STEP_INDEX = CALCULATOR_STEP_KEYS.length - 1;
const LOCATION_STEP_INDEX = CALCULATOR_STEP_KEYS.indexOf("location");
const INVALID_FIELD_SELECTOR = '[aria-invalid="true"]';

export default function CalculatorWizard() {
  const t = useTranslations("calculator");
  const locale = useLocale();
  const router = useRouter();
  const steps = useCalculatorSteps();
  const questionRef = useRef<HTMLHeadingElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const [stepIndex, setStepIndex] = useState(FIRST_STEP_INDEX);
  const [announcement, setAnnouncement] = useState("");
  const hasRestoredAnswersRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isCityMissing, setIsCityMissing] = useState(false);
  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorFormSchema),
    defaultValues: CALCULATOR_DEFAULT_VALUES,
    mode: "onBlur",
  });
  const watchedValues = useWatch({ control: form.control });
  const values = form.getValues();
  const { answers, summary } = useCalculatorAnswers(values);
  const accuracy = estimateAccuracy(calculatorInputSources(values));
  const stepKey = CALCULATOR_STEP_KEYS[stepIndex];
  const { reset } = form;

  useEffect(() => {
    const storedAnswers = readCalculatorAnswers();
    if (storedAnswers) {
      reset(storedAnswers);
    }
    hasRestoredAnswersRef.current = true;
  }, [reset]);

  useEffect(() => {
    if (hasRestoredAnswersRef.current) {
      saveCalculatorAnswers(form.getValues());
    }
  }, [watchedValues, form]);

  const goToStep = (nextStepIndex: number) => {
    setStepIndex(nextStepIndex);
    setAnnouncement(
      t("stepIndicator.summary", {
        current: nextStepIndex + 1,
        total: steps.length,
        label: steps[nextStepIndex].label,
      }),
    );
    requestAnimationFrame(() => questionRef.current?.focus());
  };

  const rejectMissingCity = () => {
    setIsCityMissing(true);
    cityInputRef.current?.focus();
  };

  const revealFirstInvalidField = () => {
    requestAnimationFrame(() => {
      const invalidField = formRef.current?.querySelector<HTMLElement>(
        INVALID_FIELD_SELECTOR,
      );
      const enclosingDisclosure = invalidField?.closest("details");
      if (enclosingDisclosure) {
        enclosingDisclosure.open = true;
      }
      invalidField?.focus();
    });
  };

  const continueOrFinish = async () => {
    const isStepValid = await form.trigger(CALCULATOR_STEP_FIELDS[stepKey]);
    if (!isStepValid) {
      revealFirstInvalidField();
      return;
    }

    if (stepIndex === LOCATION_STEP_INDEX && form.getValues("city") === null) {
      rejectMissingCity();
      return;
    }

    if (stepIndex < LAST_STEP_INDEX) {
      goToStep(stepIndex + 1);
      return;
    }

    const quickCheckAnswers = toQuickCheckAnswers(form.getValues());
    if (quickCheckAnswers === null) {
      goToStep(LOCATION_STEP_INDEX);
      return;
    }
    router.push(resultsPath(locale, encodeQuickCheck(quickCheckAnswers)));
  };

  return (
    <FormProvider {...form}>
      <PageContainer className="py-6 md:py-10">
        <form
          ref={formRef}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void continueOrFinish();
          }}
          className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_380px] lg:gap-10"
        >
          <div className="flex flex-col gap-4">
            <StepIndicator
              steps={steps}
              currentStepIndex={stepIndex}
              onStepSelect={goToStep}
            />
            <Text size="small" tone="muted">
              {t("savedAutomatically")}
            </Text>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div
              key={stepKey}
              className="flex animate-step-in flex-col gap-6 text-left"
            >
              <div className="flex flex-col gap-2">
                <Heading
                  ref={questionRef}
                  level={1}
                  size="display-m"
                  id={CALCULATOR_QUESTION_ID}
                  tabIndex={-1}
                  className="focus:outline-none"
                >
                  {t(`stepContent.${stepKey}.title`)}
                </Heading>
                <Text size="body-l" tone="muted">
                  {t(`stepContent.${stepKey}.helper`)}
                </Text>
              </div>
              {stepKey === "vehicles" && <VehiclesStep />}
              {stepKey === "dailyDriving" && <DailyDrivingStep />}
              {stepKey === "location" && (
                <LocationStep
                  cityInputRef={cityInputRef}
                  isCityMissing={isCityMissing}
                />
              )}
              {stepKey === "panels" && <PanelsStep />}
            </div>
            <CalculatorActions
              isFirstStep={stepIndex === FIRST_STEP_INDEX}
              isLastStep={stepIndex === LAST_STEP_INDEX}
              onBack={() => goToStep(stepIndex - 1)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <AnswersPanel
              answers={answers}
              accuracy={accuracy}
              summary={summary}
            />
            <Text
              size="small"
              tone="muted"
              className="hidden items-center gap-2 lg:flex"
            >
              <LuLock aria-hidden="true" className="size-4 shrink-0" />
              {t("privacyNote")}
            </Text>
          </div>
        </form>
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </PageContainer>
    </FormProvider>
  );
}
