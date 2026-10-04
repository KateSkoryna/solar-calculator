import { EU_COUNTRY_CODES } from "@/lib/assumptions/eu-countries";
import {
  GEOCODING_UNAVAILABLE_ERROR_KEY,
  INVALID_CITY_QUERY_ERROR_KEY,
  MAX_CITY_RESULTS,
} from "@/lib/geocode";
import { GET as searchCities } from "../route";

const TEST_MAPBOX_KEY = "pk.test-secret-key";
const EU_COUNTRY_COUNT = 27;

const fetchMock = jest.fn();

function mapboxFeature(
  name: string,
  countryName: string,
  countryCode: string,
  latitude: number,
  longitude: number,
  regionName?: string,
  extraProperties: Record<string, string> = {},
) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [longitude, latitude] },
    properties: {
      mapbox_id: `id-${name}`,
      feature_type: "place",
      name,
      coordinates: { latitude, longitude },
      context: {
        ...(regionName ? { region: { name: regionName } } : {}),
        country: { name: countryName, country_code: countryCode },
      },
      ...extraProperties,
    },
  };
}

function mapboxReplies(features: unknown[], status = 200) {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ type: "FeatureCollection", features }), {
      status,
    }),
  );
}

function requestCities(queryString: string) {
  return searchCities(
    new Request(`http://localhost/api/geocode${queryString}`),
  );
}

function outgoingMapboxUrl() {
  return new URL(String(fetchMock.mock.calls[0][0]));
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
  process.env.MAPBOX_API = TEST_MAPBOX_KEY;
  jest.spyOn(process.stderr, "write").mockImplementation(() => true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/geocode", () => {
  it("returns normalised results for a valid query", async () => {
    mapboxReplies([
      mapboxFeature("Berlin", "Germany", "DE", 52.52, 13.405),
      mapboxFeature("Bernau", "Germany", "de", 52.68, 13.59),
    ]);

    const response = await requestCities("?q=Ber&locale=en");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      results: [
        {
          name: "Berlin",
          detail: "Germany",
          label: "Berlin, Germany",
          countryCode: "DE",
          latitude: 52.52,
          longitude: 13.405,
        },
        {
          name: "Bernau",
          detail: "Germany",
          label: "Bernau, Germany",
          countryCode: "DE",
          latitude: 52.68,
          longitude: 13.59,
        },
      ],
    });
  });

  it("returns at most five results", async () => {
    mapboxReplies(
      Array.from({ length: 8 }, (_, index) =>
        mapboxFeature(`City ${index}`, "France", "FR", 48 + index, 2),
      ),
    );

    const response = await requestCities("?q=City");
    const { results } = await response.json();

    expect(results).toHaveLength(MAX_CITY_RESULTS);
  });

  it("drops places outside the EU and malformed features", async () => {
    mapboxReplies([
      mapboxFeature("London", "United Kingdom", "GB", 51.5, -0.12),
      { properties: { name: "Broken" } },
      mapboxFeature("Lisbon", "Portugal", "PT", 38.72, -9.14),
    ]);

    const response = await requestCities("?q=L%20city");
    const { results } = await response.json();

    expect(results).toEqual([
      {
        name: "Lisbon",
        detail: "Portugal",
        label: "Lisbon, Portugal",
        countryCode: "PT",
        latitude: 38.72,
        longitude: -9.14,
      },
    ]);
  });

  it("asks Mapbox for places in all 27 EU countries in the request locale", async () => {
    mapboxReplies([]);

    await requestCities("?q=Ber&locale=de");

    const url = outgoingMapboxUrl();
    const requestedCountries = url.searchParams.get("country")?.split(",");
    expect(url.origin + url.pathname).toBe(
      "https://api.mapbox.com/search/geocode/v6/forward",
    );
    expect(requestedCountries).toHaveLength(EU_COUNTRY_COUNT);
    expect(requestedCountries).toEqual(
      EU_COUNTRY_CODES.map((countryCode) => countryCode.toLowerCase()),
    );
    expect(url.searchParams.get("types")).toBe("place");
    expect(url.searchParams.get("language")).toBe("de");
    expect(url.searchParams.get("q")).toBe("Ber");
    expect(url.searchParams.get("access_token")).toBe(TEST_MAPBOX_KEY);
  });

  it("falls back to the default locale for an unknown locale", async () => {
    mapboxReplies([]);

    await requestCities("?q=Ber&locale=xx");

    expect(outgoingMapboxUrl().searchParams.get("language")).toBe("en");
  });

  it("never exposes the key in the response", async () => {
    mapboxReplies([mapboxFeature("Berlin", "Germany", "DE", 52.52, 13.405)]);

    const response = await requestCities("?q=Berlin");

    expect(await response.text()).not.toContain(TEST_MAPBOX_KEY);
    expect(JSON.stringify([...response.headers])).not.toContain(
      TEST_MAPBOX_KEY,
    );
  });

  it.each([
    "?q=B",
    "",
    "?q=%20%20B%20",
    `?q=${"a".repeat(81)}`,
    "?q=Paris%3BBerlin",
    `?q=${Array.from({ length: 21 }, () => "a").join("%20")}`,
  ])(
    "rejects the query %s with 400 without calling Mapbox",
    async (queryString) => {
      const response = await requestCities(queryString);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: INVALID_CITY_QUERY_ERROR_KEY,
      });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("returns 503 without Mapbox details when Mapbox fails", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Internal mapbox failure", token: "abc" }),
        { status: 500 },
      ),
    );

    const response = await requestCities("?q=Berlin");
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(JSON.parse(body)).toEqual({
      error: GEOCODING_UNAVAILABLE_ERROR_KEY,
    });
    expect(body).not.toContain("mapbox");
    expect(body).not.toContain(TEST_MAPBOX_KEY);
  });

  it("returns 503 when the network request throws", async () => {
    fetchMock.mockRejectedValue(new Error("socket hang up"));

    const response = await requestCities("?q=Berlin");

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: GEOCODING_UNAVAILABLE_ERROR_KEY,
    });
  });

  it("returns 503 when Mapbox sends an unexpected body", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 200 }));

    const response = await requestCities("?q=Berlin");

    expect(response.status).toBe(503);
  });

  it("returns 503 without calling Mapbox when the key is missing", async () => {
    delete process.env.MAPBOX_API;

    const response = await requestCities("?q=Berlin");

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: GEOCODING_UNAVAILABLE_ERROR_KEY,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("adds the region to tell same-named cities apart", async () => {
    mapboxReplies([
      mapboxFeature(
        "Neustadt",
        "Germany",
        "DE",
        49.35,
        8.14,
        "Rhineland-Palatinate",
      ),
      mapboxFeature("Neustadt", "Germany", "DE", 50.73, 11.75, "Thuringia"),
      mapboxFeature("Berlin", "Germany", "DE", 52.52, 13.405, "Berlin"),
    ]);

    const response = await requestCities("?q=Neustadt");
    const { results } = await response.json();

    expect(results.map((city: { label: string }) => city.label)).toEqual([
      "Neustadt, Rhineland-Palatinate, Germany",
      "Neustadt, Thuringia, Germany",
      "Berlin, Germany",
    ]);
  });

  it("gives up on a stalled Mapbox request", async () => {
    mapboxReplies([]);

    await requestCities("?q=Berlin");

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it("prefers the place's own name and Mapbox's formatted detail", async () => {
    mapboxReplies([
      mapboxFeature(
        "Sevilla",
        "España",
        "ES",
        37.6,
        -5.82,
        "provincia de Sevilla",
        {
          name_preferred: "Cantillana",
          place_formatted: "provincia de Sevilla, España",
        },
      ),
      mapboxFeature(
        "Neustadt in Holstein",
        "Germany",
        "DE",
        54.1,
        10.81,
        "Schleswig-Holstein",
        {
          place_formatted: "Ostholstein District, Schleswig-Holstein, Germany",
        },
      ),
    ]);

    const response = await requestCities("?q=Sevilla");
    const { results } = await response.json();

    expect(results).toEqual([
      expect.objectContaining({
        name: "Cantillana",
        detail: "provincia de Sevilla, España",
        label: "Cantillana, provincia de Sevilla, España",
      }),
      expect.objectContaining({
        name: "Neustadt in Holstein",
        detail: "Ostholstein District, Schleswig-Holstein, Germany",
        label:
          "Neustadt in Holstein, Ostholstein District, Schleswig-Holstein, Germany",
      }),
    ]);
  });

  it("drops results whose label repeats an earlier one", async () => {
    mapboxReplies([
      mapboxFeature(
        "Sevilla",
        "España",
        "ES",
        37.38,
        -5.99,
        "provincia de Sevilla",
      ),
      mapboxFeature(
        "Sevilla",
        "España",
        "ES",
        37.6,
        -5.82,
        "provincia de Sevilla",
      ),
    ]);

    const response = await requestCities("?q=Sevilla");
    const { results } = await response.json();

    expect(results).toHaveLength(1);
    expect(results[0].latitude).toBe(37.38);
  });
});
