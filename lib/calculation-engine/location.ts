import type { YieldLocation } from "@/lib/assumptions/v1";
import type { AssumptionSet } from "@/lib/assumptions/v1";
import {
  DEGREES_TO_RADIANS,
  EARTH_RADIUS_KM,
} from "@/lib/calculation-engine/constants";
import type { ResolvedInput } from "@/lib/calculation-engine/types";

export function distanceBetweenKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const latitudeDifference = (to.latitude - from.latitude) * DEGREES_TO_RADIANS;
  const longitudeDifference =
    (to.longitude - from.longitude) * DEGREES_TO_RADIANS;
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(from.latitude * DEGREES_TO_RADIANS) *
      Math.cos(to.latitude * DEGREES_TO_RADIANS) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function findNearestYieldLocation(
  assumptionSet: AssumptionSet,
  input: Pick<ResolvedInput, "countryCode" | "latitude" | "longitude">,
): YieldLocation {
  const locationsInCountry = assumptionSet.yieldLocations.filter(
    (location) => location.countryCode === input.countryCode,
  );

  if (locationsInCountry.length === 0) {
    throw new Error(`Unsupported country code: ${input.countryCode}`);
  }

  return locationsInCountry.reduce((nearest, candidate) =>
    distanceBetweenKm(input, candidate) < distanceBetweenKm(input, nearest)
      ? candidate
      : nearest,
  );
}
