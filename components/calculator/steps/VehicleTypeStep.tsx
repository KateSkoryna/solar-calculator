"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { LuBus, LuTruck, LuContainer } from "react-icons/lu";
import { PiVanBold } from "react-icons/pi";
import { VehicleType } from "@/types/calculator";

export default function VehicleTypeStep() {
  const t = useTranslations("calculator");
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const vehicleType = watch("vehicleType");

  const vehicleTypes = [
    { value: VehicleType.BUS, label: t("bus"), Icon: LuBus },
    { value: VehicleType.TRAILER, label: t("trailer"), Icon: LuContainer },
    { value: VehicleType.TRUCK, label: t("truck"), Icon: LuTruck },
    { value: VehicleType.VAN, label: t("van"), Icon: PiVanBold },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {vehicleTypes.map((vehicle) => {
          const IconComponent = vehicle.Icon;
          const isSelected = vehicleType === vehicle.value;

          return (
            <button
              type="button"
              key={vehicle.value}
              onClick={() =>
                setValue("vehicleType", vehicle.value, {
                  shouldValidate: true,
                })
              }
              className={`relative p-3 border-2 rounded-lg transition-all duration-300 group bg-white/10 backdrop-blur-md flex-1
                ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)]/20 scale-105"
                    : "border-white/20 hover:border-[var(--accent)]/50 scale-100"
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
                        : "text-[var(--text-white)] group-hover:text-[var(--accent)]"
                    }`}
                />
                <span
                  className={`font-medium text-sm ${
                    isSelected
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-white)] group-hover:text-[var(--accent)]"
                  }`}
                >
                  {vehicle.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {errors.vehicleType && (
        <p className="text-red-500 text-sm mt-1">
          {errors.vehicleType.message as string}
        </p>
      )}
    </div>
  );
}
