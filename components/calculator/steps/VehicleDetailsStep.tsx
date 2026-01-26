"use client";

import { useTranslations } from "next-intl";
import { FormData } from "../MultiStepForm";

interface VehicleDetailsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function VehicleDetailsStep({
  formData,
  updateFormData,
}: VehicleDetailsStepProps) {
  const t = useTranslations("calculator");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
          {t("dailyDistance")}
        </label>
        <input
          type="number"
          value={formData.dailyDistance || ""}
          onChange={(e) =>
            updateFormData({ dailyDistance: Number(e.target.value) })
          }
          className="w-full p-3 border border-[var(--border)] rounded-md
            bg-[var(--input)] text-[var(--text-body)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder={t("distancePlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
          {t("fuelConsumption")}
        </label>
        <input
          type="number"
          value={formData.fuelConsumption || ""}
          onChange={(e) =>
            updateFormData({ fuelConsumption: Number(e.target.value) })
          }
          className="w-full p-3 border border-[var(--border)] rounded-md
            bg-[var(--input)] text-[var(--text-body)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder={t("consumptionPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
          {t("fuelType")}
        </label>
        <select
          value={formData.fuelType}
          onChange={(e) => updateFormData({ fuelType: e.target.value })}
          className="w-full p-3 border border-[var(--border)] rounded-md
            bg-[var(--input)] text-[var(--text-body)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">{t("selectFuelType")}</option>
          <option value="diesel">{t("diesel")}</option>
          <option value="gasoline">{t("gasoline")}</option>
          <option value="electric">{t("electric")}</option>
          <option value="hybrid">{t("hybrid")}</option>
        </select>
      </div>
    </div>
  );
}
