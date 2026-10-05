import { NextResponse } from "next/server";
import {
  citySearchQuerySchema,
  GEOCODING_UNAVAILABLE_ERROR_KEY,
  GeocodingUnavailableError,
  INVALID_CITY_QUERY_ERROR_KEY,
  searchEuCities,
} from "@/lib/geocode";
import { toErrorResponse } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = citySearchQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
      locale: searchParams.get("locale") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: INVALID_CITY_QUERY_ERROR_KEY },
        { status: 400 },
      );
    }

    const results = await searchEuCities(
      parsedQuery.data.q,
      parsedQuery.data.locale,
    );

    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof GeocodingUnavailableError) {
      logger.warn("geocoding_unavailable", { reason: error.message });
      return NextResponse.json(
        { error: GEOCODING_UNAVAILABLE_ERROR_KEY },
        { status: 503 },
      );
    }
    return toErrorResponse(error);
  }
}
