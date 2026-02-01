import { useTranslations } from "next-intl";
import PageTitle from "@/components/common/PageTitle";
import Section from "@/components/layout/Section";
import Form from "@/components/form/Form";
import VehicleTypeStep from "@/components/calculator/steps/VehicleTypeStep";
import VehicleDetailsStep from "@/components/calculator/steps/VehicleDetailsStep";
import LocationSetupStep from "@/components/calculator/steps/LocationSetupStep";
import UserPromptStep from "@/components/calculator/steps/UserPromptStep";

export default function Calculator() {
  const t = useTranslations("calculator");

  const steps = [
    {
      name: "vehicleTypeSelection",
      component: VehicleTypeStep,
    },
    {
      name: "vehicleDetails",
      component: VehicleDetailsStep,
    },
    {
      name: "locationSetup",
      component: LocationSetupStep,
    },
    {
      name: "additionalNotes",
      component: UserPromptStep,
    },
  ];

  return (
    <Section className="text-left">
      <PageTitle>{t("title")}</PageTitle>

      <p className="text-center text-lg text-[var(--text-white)] mb-6">
        {t("subtitle")}
      </p>

      <div className="w-full mx-auto md:w-3/4 lg:w-1/2">
        <Form steps={steps} />
      </div>
    </Section>
  );
}
