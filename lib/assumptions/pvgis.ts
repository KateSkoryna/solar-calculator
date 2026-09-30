import { assumption, type AssumptionSource } from "@/lib/assumptions/sources";
import type { Assumption } from "@/lib/assumptions/types";

const PVGIS_BASE_URL = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc";
const PVGIS_SYSTEM_LOSS_PERCENT = 14;
const VERTICAL_TILT_DEGREES = 90;
const VERTICAL_ASPECTS_DEGREES = [0, 90, 180, -90] as const;

export interface PvgisLocationYield {
  latitude: number;
  longitude: number;
  flat: number;
  flatYearlyDeviation: number;
  vertical: number;
  verticalYearlyDeviation: number;
  verticalByAspect: readonly [number, number, number, number];
}

export interface LocationYieldAssumptions {
  flat: Assumption;
  vertical: Assumption;
}

function pvgisRequestUrl(
  location: PvgisLocationYield,
  tilt: number,
  aspect: number,
) {
  const { latitude, longitude } = location;
  return `${PVGIS_BASE_URL}?lat=${latitude}&lon=${longitude}&peakpower=1&loss=${PVGIS_SYSTEM_LOSS_PERCENT}&angle=${tilt}&aspect=${aspect}&outputformat=json`;
}

function pvgisSource(sourceUrl: string): AssumptionSource {
  return { sourceUrl, sourceTitle: "PVGIS 5.3 (EU JRC) PVcalc" };
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function yieldRange(mean: number, yearlyDeviation: number) {
  return [
    roundToOneDecimal(mean - yearlyDeviation),
    roundToOneDecimal(mean),
    roundToOneDecimal(mean + yearlyDeviation),
  ] as const;
}

export function buildLocationYieldAssumptions(
  location: PvgisLocationYield,
): LocationYieldAssumptions {
  const { verticalByAspect } = location;
  const verticalRequestUrls = VERTICAL_ASPECTS_DEGREES.map((aspect) =>
    pvgisRequestUrl(location, VERTICAL_TILT_DEGREES, aspect),
  );

  return {
    flat: assumption({
      range: yieldRange(location.flat, location.flatYearlyDeviation),
      unit: "kWh/kWp/year",
      direction: "higher",
      source: pvgisSource(pvgisRequestUrl(location, 0, 0)),
      note: `1 kWp, tilt 0, system loss ${PVGIS_SYSTEM_LOSS_PERCENT}%. Range is one yearly standard deviation (${location.flatYearlyDeviation}).`,
    }),
    vertical: assumption({
      range: yieldRange(location.vertical, location.verticalYearlyDeviation),
      unit: "kWh/kWp/year",
      direction: "higher",
      source: pvgisSource(verticalRequestUrls[0]),
      note: `Mean of tilt ${VERTICAL_TILT_DEGREES} facing south, west, north and east: ${verticalByAspect.join(", ")}. Range is one yearly standard deviation (${location.verticalYearlyDeviation}). Requests: ${verticalRequestUrls.join(" ")}`,
    }),
  };
}
