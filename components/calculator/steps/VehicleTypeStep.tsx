"use client";

import { useTranslations } from "next-intl";
import { FormData } from "../MultiStepForm";
import { LuBus, LuTruck, LuContainer } from "react-icons/lu";
import { PiVanBold } from "react-icons/pi";

interface VehicleTypeStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function VehicleTypeStep({
  formData,
  updateFormData,
}: VehicleTypeStepProps) {
  const t = useTranslations("calculator");

  const vehicleTypes = [
    { value: "bus", label: t("bus"), Icon: LuBus },
    { value: "trailer", label: t("trailer"), Icon: LuContainer },
    { value: "truck", label: t("truck"), Icon: LuTruck },
    { value: "van", label: t("van"), Icon: PiVanBold },
  ];

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[var(--border)]">
        <h4 className="text-sm font-medium text-[var(--text-body)] mb-2">
          {t("selectVehicleType")}
        </h4>

        <div className="flex gap-3 p-2">
          {vehicleTypes.map((vehicle) => {
            const IconComponent = vehicle.Icon;
            const isSelected = formData.vehicleType === vehicle.value;

            return (
              <button
                key={vehicle.value}
                onClick={() => updateFormData({ vehicleType: vehicle.value })}
                className={`relative p-3 border-2 rounded-lg transition-all duration-300 group bg-[var(--form-bg)] flex-1
                  ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 scale-105"
                      : "border-[var(--border)] hover:border-[var(--accent)]/50 scale-100"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent)] rounded-full" />
                )}
                <div className="flex flex-col items-center gap-2">
                  <IconComponent
                    className={`w-8 h-8 transition-colors
                      ${
                        isSelected
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-body)] group-hover:text-[var(--accent)]"
                      }`}
                  />
                  <span className="font-medium text-[var(--text-heading)] text-sm">
                    {vehicle.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[var(--text-body)] mb-2">
          {t("vehicleDetails")}
        </h4>

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
    </div>
  );
}
