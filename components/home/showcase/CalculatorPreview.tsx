import { useTranslations } from "next-intl";
import { VehicleType } from "@/app/generated/prisma/enums";
import MockScreen from "@/components/home/showcase/MockScreen";
import { VEHICLE_ICONS } from "@/components/icons/vehicle-icons";
import {
  SCROLL_REVEAL_CLASSES,
  SCROLL_STAGGER_CLASSES,
} from "@/lib/scroll-animation";

const PREVIEW_STEP_NUMBER = 1;
const CALCULATOR_STEP_COUNT = 4;
const SELECTED_VEHICLE_TYPE: VehicleType = VehicleType.VAN;

export default function CalculatorPreview() {
  const t = useTranslations();

  return (
    <div className="relative rounded-[36px] bg-lime-soft p-5 md:p-10 lg:p-12">
      <MockScreen
        label={t("home.features.calculator.previewLabel")}
        className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6 text-left text-ink shadow-hover md:p-7"
      >
        <div className="flex items-center justify-between text-sm font-semibold text-muted">
          <span>
            {t("calculator.stepIndicator.position", {
              current: PREVIEW_STEP_NUMBER,
              total: CALCULATOR_STEP_COUNT,
            })}
          </span>
          <span>{t("calculator.steps.vehicles")}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-track">
          <div
            className={`h-full w-1/4 rounded-full bg-chart-profit ${SCROLL_REVEAL_CLASSES.line}`}
          />
        </div>
        <span className="font-display text-2xl leading-tight font-bold tracking-[-0.02em]">
          {t("calculator.stepContent.vehicles.title")}
        </span>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(VehicleType).map((vehicleType) => {
            const VehicleIcon = VEHICLE_ICONS[vehicleType];
            return (
              <div
                key={vehicleType}
                className={`flex flex-col gap-2.5 rounded-lg border p-4 font-semibold ${
                  vehicleType === SELECTED_VEHICLE_TYPE
                    ? "border-ink bg-ground shadow-ring-selected"
                    : "border-line"
                }`}
              >
                <VehicleIcon className="size-7 stroke-[1.6] text-forest" />
                {t(`calculator.options.vehicleType.${vehicleType}`)}
              </div>
            );
          })}
        </div>
      </MockScreen>
      <span
        className={`absolute -top-4 right-3 rounded-full bg-hero px-4 py-2.5 text-sm font-semibold text-white shadow-hover ${SCROLL_REVEAL_CLASSES.zoom} ${SCROLL_STAGGER_CLASSES[2]}`}
      >
        {t("home.ctaHint")}
      </span>
    </div>
  );
}
