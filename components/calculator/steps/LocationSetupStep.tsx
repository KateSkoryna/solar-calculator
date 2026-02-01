"use client";

import { useTranslations } from "next-intl";
import Input from "@/components/form/Input";
import Dropdown from "@/components/form/Dropdown";
import { SolarPanelPlacement, ParkingLocation } from "@/types/calculator";

export default function LocationSetupStep() {
  const t = useTranslations("calculator");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          name="city"
          label={t("city")}
          type="text"
          placeholder={t("cityPlaceholder")}
        />

        <Input
          name="country"
          label={t("country")}
          type="text"
          placeholder={t("countryPlaceholder")}
        />
      </div>

      <Dropdown
        name="solarPanelPlacement"
        label={t("solarPanelPlacement")}
        placeholder={t("selectPanelPlacement")}
        options={[
          {
            value: SolarPanelPlacement.ROOF,
            label: t("roofPlacement"),
          },
          {
            value: SolarPanelPlacement.SIDES,
            label: t("sidesPlacement"),
          },
          {
            value: SolarPanelPlacement.BACK,
            label: t("backPlacement"),
          },
          {
            value: SolarPanelPlacement.ALL_OVER,
            label: t("allOverPlacement"),
          },
        ]}
      />

      <Dropdown
        name="daytimeParking"
        label={t("daytimeParking")}
        placeholder={t("selectParkingLocation")}
        options={[
          { value: ParkingLocation.OUTDOOR, label: t("outdoor") },
          { value: ParkingLocation.COVERED, label: t("covered") },
          { value: ParkingLocation.INDOOR, label: t("indoor") },
          { value: ParkingLocation.MIXED, label: t("mixedLocation") },
        ]}
      />

      <Dropdown
        name="nighttimeParking"
        label={t("nighttimeParking")}
        placeholder={t("selectParkingLocation")}
        options={[
          { value: ParkingLocation.OUTDOOR, label: t("outdoor") },
          { value: ParkingLocation.COVERED, label: t("covered") },
          { value: ParkingLocation.INDOOR, label: t("indoor") },
          { value: ParkingLocation.MIXED, label: t("mixedLocation") },
        ]}
      />
    </div>
  );
}
