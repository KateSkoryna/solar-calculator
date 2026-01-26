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
    { value: "van", label: t("van"), Icon: PiVanBold },
    { value: "truck", label: t("truck"), Icon: LuTruck },
    { value: "bus", label: t("bus"), Icon: LuBus },
    { value: "trailer", label: t("trailer"), Icon: LuContainer },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-[var(--text-body)] mb-4">
          {t("selectVehicleType")}
        </h4>

        <div className="grid grid-cols-2 gap-4">
          {vehicleTypes.map((vehicle) => {
            const IconComponent = vehicle.Icon;
            const isSelected = formData.vehicleType === vehicle.value;

            return (
              <button
                key={vehicle.value}
                onClick={() => updateFormData({ vehicleType: vehicle.value })}
                className={`p-6 border-2 rounded-lg transition-all group bg-[var(--form-bg)]
                  ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border)] hover:border-[var(--accent)]/50"
                  }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <IconComponent
                    className={`w-16 h-16 transition-colors
                      ${
                        isSelected
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-body)] group-hover:text-[var(--accent)]"
                      }`}
                  />
                  <span className="font-medium text-[var(--text-heading)]">
                    {vehicle.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
