import type { CityResult } from "@/lib/geocode";

const GEOCODE_API_PATH = "/api/geocode";

export const MIN_CITY_SEARCH_LENGTH = 2;
export const CITY_SEARCH_DEBOUNCE_MS = 300;

export class CitySearchError extends Error {
  constructor() {
    super("City search failed");
    this.name = "CitySearchError";
  }
}

export async function fetchCities(
  query: string,
  locale: string,
  signal?: AbortSignal,
): Promise<CityResult[]> {
  const searchParameters = new URLSearchParams({ q: query, locale });
  const response = await fetch(`${GEOCODE_API_PATH}?${searchParameters}`, {
    signal,
  });
  if (!response.ok) {
    throw new CitySearchError();
  }
  const body: { results: CityResult[] } = await response.json();
  return body.results;
}
