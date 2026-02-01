"use client";

import { useTranslations } from "next-intl";
import Input from "@/components/form/Input";
import Dropdown from "@/components/form/Dropdown";
import { InstallationType } from "@/types/calculator";

export default function SetupDetailsStep() {
  const t = useTranslations("calculator");

  return (
    <div className="space-y-3">
      <Input
        name="roofArea"
        label={t("roofArea")}
        type="number"
        placeholder={t("areaPlaceholder")}
      />

      <Input
        name="budget"
        label={t("budget")}
        type="number"
        placeholder={t("budgetPlaceholder")}
      />

      <Dropdown
        name="installationType"
        label={t("installationType")}
        placeholder={t("selectInstallationType")}
        options={[
          { value: InstallationType.ROOF, label: t("roofMounted") },
          { value: InstallationType.GROUND, label: t("groundMounted") },
          { value: InstallationType.PORTABLE, label: t("portable") },
        ]}
      />
    </div>
  );
}
