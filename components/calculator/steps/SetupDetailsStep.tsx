"use client";

import { useTranslations } from "next-intl";
import { FormData } from "../MultiStepForm";

interface SetupDetailsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function SetupDetailsStep({
  formData,
  updateFormData,
}: SetupDetailsStepProps) {
  const t = useTranslations("calculator");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
          {t("roofArea")}
        </label>
        <input
          type="number"
          value={formData.roofArea || ""}
          onChange={(e) => updateFormData({ roofArea: Number(e.target.value) })}
          className="w-full p-3 border border-[var(--border)] rounded-md
            bg-[var(--input)] text-[var(--text-body)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder={t("areaPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
          {t("budget")}
        </label>
        <input
          type="number"
          value={formData.budget || ""}
          onChange={(e) => updateFormData({ budget: Number(e.target.value) })}
          className="w-full p-3 border border-[var(--border)] rounded-md
            bg-[var(--input)] text-[var(--text-body)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder={t("budgetPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
          {t("installationType")}
        </label>
        <select
          value={formData.installationType}
          onChange={(e) => updateFormData({ installationType: e.target.value })}
          className="w-full p-3 border border-[var(--border)] rounded-md
            bg-[var(--input)] text-[var(--text-body)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">{t("selectInstallationType")}</option>
          <option value="roof">{t("roofMounted")}</option>
          <option value="ground">{t("groundMounted")}</option>
          <option value="portable">{t("portable")}</option>
        </select>
      </div>
    </div>
  );
}
