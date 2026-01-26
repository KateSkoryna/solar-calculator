"use client";

import { useTranslations } from "next-intl";
import { FormData } from "../MultiStepForm";

interface UserPromptStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function UserPromptStep({
  formData,
  updateFormData,
}: UserPromptStepProps) {
  const t = useTranslations("calculator");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
          {t("additionalNotes")}
        </label>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
          rows={6}
          className="w-full p-3 border border-[var(--border)] rounded-md
            bg-[var(--input)] text-[var(--text-body)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
            resize-none"
          placeholder={t("notesPlaceholder")}
        />
      </div>

      <div className="p-4 bg-[var(--background)] rounded-md">
        <h4 className="text-sm font-semibold text-[var(--text-heading)] mb-2">
          {t("reviewYourInfo")}
        </h4>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--text-body)]">{t("vehicleType")}:</dt>
            <dd className="font-medium text-[var(--text-heading)]">
              {formData.vehicleType || "-"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--text-body)]">{t("dailyDistance")}:</dt>
            <dd className="font-medium text-[var(--text-heading)]">
              {formData.dailyDistance || "-"} km
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--text-body)]">{t("roofArea")}:</dt>
            <dd className="font-medium text-[var(--text-heading)]">
              {formData.roofArea || "-"} m²
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
