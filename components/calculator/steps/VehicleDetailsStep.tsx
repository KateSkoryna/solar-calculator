"use client";

import { useTranslations } from "next-intl";
import Input from "@/components/form/Input";
import Dropdown from "@/components/form/Dropdown";
import Checkbox from "@/components/form/Checkbox";
import { EngineType, ParkingType } from "@/types/calculator";

export default function VehicleDetailsStep() {
  const t = useTranslations("calculator");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          name="manufacturer"
          label={t("manufacturer")}
          type="text"
          placeholder={t("manufacturerPlaceholder")}
        />

        <Input
          name="model"
          label={t("model")}
          type="text"
          placeholder={t("modelPlaceholder")}
        />
      </div>

      <Input
        name="numberOfVehicles"
        label={t("numberOfVehicles")}
        type="number"
        placeholder="1"
      />

      <Input
        name="averageDailyDistance"
        label={t("averageDailyDistance")}
        type="number"
        placeholder="0"
      />

      <Input
        name="energyConsumption"
        label={t("energyConsumption")}
        type="number"
        placeholder="0.0"
      />

      <Input
        name="solarPanelCapacity"
        label={t("solarPanelCapacity")}
        type="number"
        placeholder="0.0"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          name="payloadReserve"
          label={t("payloadReserve")}
          type="number"
          placeholder="0.0"
        />

        <Input
          name="maxRoofLoad"
          label={t("maxRoofLoad")}
          type="number"
          placeholder="0.0"
        />
      </div>

      <Dropdown
        name="engineType"
        label={t("engineType")}
        placeholder={t("selectEngineType")}
        options={[
          { value: EngineType.DIESEL, label: t("diesel") },
          { value: EngineType.PETROL, label: t("petrol") },
          { value: EngineType.ELECTRIC, label: t("electric") },
        ]}
      />

      <Dropdown
        name="parkingType"
        label={t("parkingType")}
        placeholder={t("selectParkingType")}
        options={[
          { value: ParkingType.DEPOT, label: t("depot") },
          { value: ParkingType.STREET, label: t("street") },
          { value: ParkingType.CUSTOMER_SITE, label: t("customerSite") },
          { value: ParkingType.MIXED, label: t("mixedParking") },
        ]}
      />

      <Input
        name="operatingMonths"
        label={t("operatingMonths")}
        type="number"
        placeholder="12"
      />

      <Checkbox name="winterUsage" label={t("winterUsage")} />
    </div>
  );
}
