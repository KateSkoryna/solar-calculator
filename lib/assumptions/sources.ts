import {
  ASSUMPTION_SOURCE_TITLE,
  type Assumption,
  type FavourableDirection,
} from "@/lib/assumptions/types";

export const ACCESSED_ON = "2026-09-30";

export interface AssumptionSource {
  sourceUrl: string;
  sourceTitle: string;
}

export const ASSUMED: AssumptionSource = {
  sourceUrl: "",
  sourceTitle: ASSUMPTION_SOURCE_TITLE,
};

export const SOURCES = {
  afdcIdling: {
    sourceUrl:
      "https://afdc.energy.gov/files/u/publication/hdv_idling_2015.pdf",
    sourceTitle:
      "U.S. DOE Vehicle Technologies Office and Argonne: Long-Haul Truck Idling",
  },
  cenexRefrigeratedTransport: {
    sourceUrl:
      "https://www.cenex.co.uk/app/uploads/2021/04/Refrigerated-Transport-White-Paper.pdf",
    sourceTitle: "Cenex: Refrigerated Transport Insights (2021)",
  },
  epaEquivalencies: {
    sourceUrl:
      "https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references",
    sourceTitle:
      "U.S. EPA: Greenhouse Gases Equivalencies Calculator, calculations and references",
  },
  nrelPvDegradation: {
    sourceUrl: "https://docs.nlr.gov/docs/fy12osti/51664.pdf",
    sourceTitle:
      "Jordan and Kurtz (NREL, 2012): Photovoltaic Degradation Rates, an Analytical Review",
  },
  geotabBatteryHealth: {
    sourceUrl:
      "https://www.carmagazine.co.uk/car-news/motoring-issues/ev-battery-life-survey-2025/",
    sourceTitle:
      "Geotab EV battery health study 2025, as reported by CAR Magazine",
  },
  volvoFhElectric: {
    sourceUrl:
      "https://volvotrucks.com/en-en/news-stories/stories/2022/jan/volvo-fh-electric-excel-in-first-road-test.html",
    sourceTitle: "Volvo Trucks: Volvo FH Electric road test",
  },
  euOilBulletin: {
    sourceUrl:
      "https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en",
    sourceTitle:
      "European Commission: EU Weekly Oil Bulletin, prices with taxes history and VAT table",
  },
  eurostatElectricityPrices: {
    sourceUrl:
      "https://ec.europa.eu/eurostat/databrowser/view/nrg_pc_205/default/table",
    sourceTitle:
      "Eurostat nrg_pc_205: electricity prices for non-household consumers, band IB (20 to 499 MWh)",
  },
  emberGridIntensity: {
    sourceUrl:
      "https://ourworldindata.org/grapher/carbon-intensity-electricity",
    sourceTitle:
      "Ember via Our World in Data: lifecycle carbon intensity of electricity generation",
  },
} satisfies Record<string, AssumptionSource>;

interface AssumptionInput {
  range: readonly [number, number, number];
  unit: string;
  direction: FavourableDirection;
  source: AssumptionSource;
  note?: string;
}

export function assumption({
  range: [pessimistic, realistic, optimistic],
  unit,
  direction,
  source,
  note,
}: AssumptionInput): Assumption {
  return {
    value: { pessimistic, realistic, optimistic },
    unit,
    sourceUrl: source.sourceUrl,
    sourceTitle: source.sourceTitle,
    accessedOn: ACCESSED_ON,
    favourableDirection: direction,
    note,
  };
}
