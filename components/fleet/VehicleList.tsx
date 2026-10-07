import { useFormatter, useLocale, useTranslations } from "next-intl";
import Card from "@/components/common/Card";
import { useVehicleDisplayName } from "@/components/fleet/useVehicleDisplayName";
import ButtonLink from "@/components/form/ButtonLink";
import type { FleetVehicleRow } from "@/lib/fleet-vehicles";
import { shortCityName } from "@/lib/vehicle-display-name";
import { fleetEditVehiclePath } from "@/lib/workspace-path";

const ROW_GRID_CLASSES =
  "lg:grid lg:grid-cols-[2fr_1fr_80px_1.4fr_100px] lg:items-center lg:gap-4 lg:[&>span:not(:first-child)]:text-center";

interface VehicleListProps {
  vehicles: FleetVehicleRow[];
  fleetSlug: string;
  canEdit: boolean;
}

export default function VehicleList({
  vehicles,
  fleetSlug,
  canEdit,
}: VehicleListProps) {
  const t = useTranslations("vehicles.list");
  const tVehicleType = useTranslations("calculator.options.vehicleType");
  const locale = useLocale();
  const format = useFormatter();
  const displayName = useVehicleDisplayName();

  return (
    <Card as="section" title={t("title")}>
      <div
        aria-hidden="true"
        className={`hidden border-b border-line pb-3 text-[13px] font-semibold text-muted ${ROW_GRID_CLASSES}`}
      >
        <span>{t("columns.name")}</span>
        <span>{t("columns.type")}</span>
        <span>{t("columns.count")}</span>
        <span>{t("columns.location")}</span>
        <span />
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:gap-0">
        {vehicles.map((vehicle) => (
          <li key={vehicle.id}>
            <div
              className={`flex flex-col gap-2 rounded-lg border border-line p-4 lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-4 ${ROW_GRID_CLASSES}`}
            >
              <span className="font-semibold text-ink">
                {displayName(vehicle)}
              </span>
              <span className="text-sm text-muted lg:hidden">
                {tVehicleType(vehicle.vehicleType)} · {vehicle.quantity} ·{" "}
                {shortCityName(vehicle.city)}
              </span>
              <span className="hidden text-[15px] text-ink lg:block">
                {tVehicleType(vehicle.vehicleType)}
              </span>
              <span className="hidden text-[15px] text-ink lg:block">
                {format.number(vehicle.quantity)}
              </span>
              <span className="hidden text-[15px] text-ink lg:block">
                {shortCityName(vehicle.city)}
              </span>
              {canEdit && (
                <span>
                  <ButtonLink
                    href={fleetEditVehiclePath(locale, fleetSlug, vehicle.id)}
                    variant="secondary"
                    size="sm"
                    aria-label={t("editLabel", {
                      vehicle: displayName(vehicle),
                    })}
                  >
                    {t("edit")}
                  </ButtonLink>
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
