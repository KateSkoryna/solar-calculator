import { z } from "zod";
import { defaultLocale, locales, type Locale } from "@/i18n";
import {
  EU_COUNTRY_CODES,
  type EuCountryCode,
} from "@/lib/assumptions/eu-countries";

const MAPBOX_FORWARD_GEOCODING_URL =
  "https://api.mapbox.com/search/geocode/v6/forward";
const MAPBOX_PLACE_TYPE = "place";
const MIN_CITY_QUERY_LENGTH = 2;
const MAX_CITY_QUERY_LENGTH = 80;
const MAX_CITY_QUERY_WORDS = 20;
const FORBIDDEN_QUERY_CHARACTER = ";";
const MAPBOX_TIMEOUT_MS = 5000;
const LABEL_PART_SEPARATOR = ", ";

export const MAX_CITY_RESULTS = 5;
export const GEOCODING_UNAVAILABLE_ERROR_KEY = "geocoding_unavailable";
export const INVALID_CITY_QUERY_ERROR_KEY = "invalid_query";

export const citySearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(MIN_CITY_QUERY_LENGTH)
    .max(MAX_CITY_QUERY_LENGTH)
    .refine((query) => !query.includes(FORBIDDEN_QUERY_CHARACTER))
    .refine((query) => query.split(/\s+/).length <= MAX_CITY_QUERY_WORDS),
  locale: z.enum(locales).catch(defaultLocale),
});

const mapboxFeatureSchema = z.object({
  properties: z.object({
    name: z.string().min(1),
    name_preferred: z.string().min(1).optional(),
    place_formatted: z.string().min(1).optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
    context: z.object({
      region: z.object({ name: z.string().min(1) }).optional(),
      country: z.object({
        name: z.string().min(1),
        country_code: z.string().min(1),
      }),
    }),
  }),
});

const mapboxResponseSchema = z.object({
  features: z.array(z.unknown()),
});

export interface CityResult {
  name: string;
  detail: string;
  label: string;
  countryCode: EuCountryCode;
  latitude: number;
  longitude: number;
}

export class GeocodingUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "GeocodingUnavailableError";
  }
}

function isEuCountryCode(countryCode: string): countryCode is EuCountryCode {
  return (EU_COUNTRY_CODES as readonly string[]).includes(countryCode);
}

function buildCityDetail(
  cityName: string,
  regionName: string | undefined,
  countryName: string,
) {
  const distinctRegionName =
    regionName && regionName !== cityName ? regionName : null;
  return [distinctRegionName, countryName]
    .filter(Boolean)
    .join(LABEL_PART_SEPARATOR);
}

function hasUniqueLabel(
  city: CityResult,
  cityIndex: number,
  cities: CityResult[],
) {
  return (
    cities.findIndex((otherCity) => otherCity.label === city.label) ===
    cityIndex
  );
}

function toCityResult(feature: unknown): CityResult | null {
  const parsedFeature = mapboxFeatureSchema.safeParse(feature);
  if (!parsedFeature.success) return null;

  const { name, name_preferred, place_formatted, coordinates, context } =
    parsedFeature.data.properties;
  const cityName = name_preferred ?? name;
  const detail =
    place_formatted ??
    buildCityDetail(cityName, context.region?.name, context.country.name);
  const countryCode = context.country.country_code.toUpperCase();
  if (!isEuCountryCode(countryCode)) return null;

  return {
    name: cityName,
    detail,
    label: [cityName, detail].join(LABEL_PART_SEPARATOR),
    countryCode,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
}

function buildMapboxUrl(query: string, locale: Locale, accessToken: string) {
  const url = new URL(MAPBOX_FORWARD_GEOCODING_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("types", MAPBOX_PLACE_TYPE);
  url.searchParams.set("country", EU_COUNTRY_CODES.join(",").toLowerCase());
  url.searchParams.set("language", locale);
  url.searchParams.set("limit", String(MAX_CITY_RESULTS));
  url.searchParams.set("access_token", accessToken);
  return url;
}

export async function searchEuCities(
  query: string,
  locale: Locale,
): Promise<CityResult[]> {
  const accessToken = process.env.MAPBOX_API;
  if (!accessToken) {
    throw new GeocodingUnavailableError("missing_access_token");
  }

  const mapboxResponse = await fetch(
    buildMapboxUrl(query, locale, accessToken),
    { signal: AbortSignal.timeout(MAPBOX_TIMEOUT_MS) },
  ).catch(() => {
    throw new GeocodingUnavailableError("request_failed");
  });
  if (!mapboxResponse.ok) {
    throw new GeocodingUnavailableError(`status_${mapboxResponse.status}`);
  }

  const parsedBody = mapboxResponseSchema.safeParse(
    await mapboxResponse.json().catch(() => null),
  );
  if (!parsedBody.success) {
    throw new GeocodingUnavailableError("unexpected_response");
  }

  return parsedBody.data.features
    .map(toCityResult)
    .filter((city): city is CityResult => city !== null)
    .filter(hasUniqueLabel)
    .slice(0, MAX_CITY_RESULTS);
}
