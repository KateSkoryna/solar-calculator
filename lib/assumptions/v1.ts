import { VehicleType } from "@/app/generated/prisma/enums";
import {
  EU_COUNTRY_CODES,
  EU_COUNTRY_DATA,
  type EuCountryCode,
} from "@/lib/assumptions/eu-countries";
import {
  buildLocationYieldAssumptions,
  type LocationYieldAssumptions,
  type PvgisLocationYield,
} from "@/lib/assumptions/pvgis";
import { ASSUMED, assumption, SOURCES } from "@/lib/assumptions/sources";
import type { CoolingUnitType } from "@/lib/assumptions/types";

const RAW_CITY_YIELDS = {
  Hamburg: {
    latitude: 53.5511,
    longitude: 9.9937,
    flat: 814.7,
    flatYearlyDeviation: 35.6,
    vertical: 470.1,
    verticalYearlyDeviation: 25.1,
    verticalByAspect: [706.5, 484.9, 187.5, 501.7],
  },
  Munich: {
    latitude: 48.1351,
    longitude: 11.582,
    flat: 948.1,
    flatYearlyDeviation: 44.5,
    vertical: 529.6,
    verticalYearlyDeviation: 28.3,
    verticalByAspect: [811.1, 552.5, 197.8, 556.9],
  },
  Lyon: {
    latitude: 45.764,
    longitude: 4.8357,
    flat: 1083.3,
    flatYearlyDeviation: 41.7,
    vertical: 579.5,
    verticalYearlyDeviation: 27.2,
    verticalByAspect: [883.6, 614.7, 198.1, 621.7],
  },
  Seville: {
    latitude: 37.3891,
    longitude: -5.9845,
    flat: 1432.5,
    flatYearlyDeviation: 24.9,
    vertical: 715.8,
    verticalYearlyDeviation: 30,
    verticalByAspect: [1069.5, 793.4, 205.7, 794.8],
  },
  Milan: {
    latitude: 45.4642,
    longitude: 9.19,
    flat: 1123.9,
    flatYearlyDeviation: 40.2,
    vertical: 606,
    verticalYearlyDeviation: 33.8,
    verticalByAspect: [955.7, 658.3, 188.3, 621.6],
  },
} satisfies Record<string, PvgisLocationYield>;

const CAPITAL_CITY_YIELDS = {
  Berlin: EU_COUNTRY_DATA.DE.capitalYield,
  Paris: EU_COUNTRY_DATA.FR.capitalYield,
  Madrid: EU_COUNTRY_DATA.ES.capitalYield,
  Rome: EU_COUNTRY_DATA.IT.capitalYield,
  Warsaw: EU_COUNTRY_DATA.PL.capitalYield,
  Amsterdam: EU_COUNTRY_DATA.NL.capitalYield,
  Vienna: EU_COUNTRY_DATA.AT.capitalYield,
  Stockholm: EU_COUNTRY_DATA.SE.capitalYield,
};

const CITY_YIELDS = {
  ...CAPITAL_CITY_YIELDS,
  ...Object.fromEntries(
    Object.entries(RAW_CITY_YIELDS).map(([name, location]) => [
      name,
      buildLocationYieldAssumptions(location),
    ]),
  ),
} as Record<
  keyof typeof CAPITAL_CITY_YIELDS | keyof typeof RAW_CITY_YIELDS,
  ReturnType<typeof buildLocationYieldAssumptions>
>;

const EXTRA_CITY_COUNTRY = {
  Hamburg: "DE",
  Munich: "DE",
  Lyon: "FR",
  Seville: "ES",
  Milan: "IT",
} satisfies Record<keyof typeof RAW_CITY_YIELDS, EuCountryCode>;

export interface YieldLocation {
  name: string;
  countryCode: EuCountryCode;
  latitude: number;
  longitude: number;
  yield: LocationYieldAssumptions;
}

const CAPITAL_YIELD_LOCATIONS: YieldLocation[] = EU_COUNTRY_CODES.map(
  (countryCode) => ({
    name: EU_COUNTRY_DATA[countryCode].capital,
    countryCode,
    ...EU_COUNTRY_DATA[countryCode].capitalLocation,
    yield: EU_COUNTRY_DATA[countryCode].capitalYield,
  }),
);

const EXTRA_CITY_YIELD_LOCATIONS: YieldLocation[] = Object.entries(
  RAW_CITY_YIELDS,
).map(([name, location]) => ({
  name,
  countryCode: EXTRA_CITY_COUNTRY[name as keyof typeof RAW_CITY_YIELDS],
  latitude: location.latitude,
  longitude: location.longitude,
  yield: CITY_YIELDS[name as keyof typeof CITY_YIELDS],
}));

const TYPICAL_COOLING_UNIT: Record<VehicleType, CoolingUnitType> = {
  VAN: "ENGINE_DRIVEN",
  TRUCK: "DIESEL",
  TRAILER: "DIESEL",
  BUS: "ELECTRIC",
};

export const ASSUMPTION_SET_V1 = {
  version: "2026.1",
  typicalCoolingUnit: TYPICAL_COOLING_UNIT,
  distanceBands: {
    SHORT: assumption({
      range: [40, 60, 80],
      unit: "km/day",
      direction: "higher",
      source: ASSUMED,
      note: "Band of the calculator's distance question. Assumption.",
    }),
    REGIONAL: assumption({
      range: [100, 150, 200],
      unit: "km/day",
      direction: "higher",
      source: ASSUMED,
      note: "Band of the calculator's distance question. Assumption.",
    }),
    LONG: assumption({
      range: [300, 400, 500],
      unit: "km/day",
      direction: "higher",
      source: ASSUMED,
      note: "Band of the calculator's distance question. Assumption.",
    }),
  },
  vehicleTypes: {
    VAN: {
      energyUsePer100km: assumption({
        range: [22, 28, 36],
        unit: "kWh/100 km",
        direction: "higher",
        source: ASSUMED,
        note: "Electric van. TUV Sud measured 21.9 kWh/100 km for a Mercedes eSprinter test drive (electrive, 2022, https://www.electrive.com/2022/11/30/mercedes-new-esprinter-reaches-475-km-range-on-test-drive); loaded urban use is higher. Realistic and optimistic values are assumptions.",
      }),
      auxiliaryDemandPerDay: assumption({
        range: [1.5, 2.4, 3.5],
        unit: "kWh/day",
        direction: "higher",
        source: ASSUMED,
        note: "Average electrical load of lights, telematics, displays and tail lift, about 0.1 kW for a van. Assumption.",
      }),
      usablePanelCapacityKw: {
        ROOF: assumption({
          range: [0.8, 1.2, 1.5],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        SIDES: assumption({
          range: [0.4, 0.8, 1.2],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        BACK: assumption({
          range: [0.2, 0.3, 0.4],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        ALL_OVER: assumption({
          range: [1.5, 2.3, 3],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
      },
      maxRoofLoadKg: assumption({
        range: [100, 150, 200],
        unit: "kg",
        direction: "higher",
        source: ASSUMED,
        note: "Typical body-builder roof load limit; the real limit depends on the model and must be checked with the manufacturer. Assumption.",
      }),
      payloadReserveKg: assumption({
        range: [50, 100, 150],
        unit: "kg",
        direction: "higher",
        source: ASSUMED,
        note: "Payload the operator can give up for the panel system. Assumption.",
      }),
    },
    TRUCK: {
      energyUsePer100km: assumption({
        range: [96.3, 110, 125],
        unit: "kWh/100 km",
        direction: "higher",
        source: SOURCES.volvoFhElectric,
        note: "Electric 40 t tractor. Volvo FH Electric used 1.1 kWh/km on a 343 km test; the eActros 600 used 96.3 kWh/100 km on a 1,530 km test (Automotive World, https://www.automotiveworld.com/news/vandijck-transport-tests-the-eactros-600-on-a-long-haul-route-of-over-1500-kilometers/). The optimistic value is an assumption for hilly or winter use.",
      }),
      auxiliaryDemandPerDay: assumption({
        range: [3, 4.8, 7],
        unit: "kWh/day",
        direction: "higher",
        source: ASSUMED,
        note: "Average load of about 0.2 kW. Assumption.",
      }),
      usablePanelCapacityKw: {
        ROOF: assumption({
          range: [2, 3, 4],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        SIDES: assumption({
          range: [1.5, 2.5, 3.5],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        BACK: assumption({
          range: [0.4, 0.6, 0.8],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        ALL_OVER: assumption({
          range: [4, 6, 8],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
      },
      maxRoofLoadKg: assumption({
        range: [200, 400, 600],
        unit: "kg",
        direction: "higher",
        source: ASSUMED,
        note: "Typical body-builder roof load limit; the real limit depends on the model and must be checked with the manufacturer. Assumption.",
      }),
      payloadReserveKg: assumption({
        range: [150, 300, 450],
        unit: "kg",
        direction: "higher",
        source: ASSUMED,
        note: "Payload the operator can give up for the panel system. Assumption.",
      }),
    },
    TRAILER: {
      energyUsePer100km: assumption({
        range: [0, 0, 0],
        unit: "kWh/100 km",
        direction: "higher",
        source: ASSUMED,
        note: "An unpowered trailer has no traction drive.",
      }),
      auxiliaryDemandPerDay: assumption({
        range: [1, 2.4, 4],
        unit: "kWh/day",
        direction: "higher",
        source: ASSUMED,
        note: "Lights, telematics and tail lift, without refrigeration. Assumption.",
      }),
      usablePanelCapacityKw: {
        ROOF: assumption({
          range: [3, 4.5, 6],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        SIDES: assumption({
          range: [2, 3.5, 5],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        BACK: assumption({
          range: [0.4, 0.6, 0.8],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        ALL_OVER: assumption({
          range: [5, 8, 11],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
      },
      maxRoofLoadKg: assumption({
        range: [300, 500, 800],
        unit: "kg",
        direction: "higher",
        source: ASSUMED,
        note: "Typical body-builder roof load limit; the real limit depends on the model and must be checked with the manufacturer. Assumption.",
      }),
      payloadReserveKg: assumption({
        range: [150, 300, 450],
        unit: "kg",
        direction: "higher",
        source: ASSUMED,
        note: "Payload the operator can give up for the panel system. Assumption.",
      }),
    },
    BUS: {
      energyUsePer100km: assumption({
        range: [80, 100, 130],
        unit: "kWh/100 km",
        direction: "higher",
        source: ASSUMED,
        note: "Electric 12 m city bus, typical published operator values. Not verified in this step.",
      }),
      auxiliaryDemandPerDay: assumption({
        range: [8, 12, 20],
        unit: "kWh/day",
        direction: "higher",
        source: ASSUMED,
        note: "Lighting, displays, ticketing and doors, without climate control. Assumption.",
      }),
      usablePanelCapacityKw: {
        ROOF: assumption({
          range: [2, 4, 6],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        SIDES: assumption({
          range: [1.5, 3, 4.5],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        BACK: assumption({
          range: [0.5, 0.8, 1],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
        ALL_OVER: assumption({
          range: [4, 7, 10],
          unit: "kWp",
          direction: "higher",
          source: ASSUMED,
          note: "Usable area from typical body dimensions times 0.2 kWp per m2 (200 Wp/m2 module power density). Assumption.",
        }),
      },
      maxRoofLoadKg: assumption({
        range: [300, 500, 700],
        unit: "kg",
        direction: "higher",
        source: ASSUMED,
        note: "Typical body-builder roof load limit; the real limit depends on the model and must be checked with the manufacturer. Assumption.",
      }),
      payloadReserveKg: assumption({
        range: [100, 200, 300],
        unit: "kg",
        direction: "higher",
        source: ASSUMED,
        note: "Payload the operator can give up for the panel system. Assumption.",
      }),
    },
  },
  coolingUnits: {
    DIESEL: {
      electricalDemandPerDay: {
        summer: assumption({
          range: [10.3, 24.3, 54.2],
          unit: "kWh/day",
          direction: "higher",
          source: SOURCES.cenexRefrigeratedTransport,
          note: "Cenex: a trailer TRU needs 13,000 to 32,000 kWh of thermal energy a year at a coefficient of performance of 2.1 to 4.5, so 2,889 to 15,238 kWh of electrical energy, mid value 6,818 kWh (18.7 kWh/day). The summer factor of 1.3 and winter factor of 0.7 are assumptions.",
        }),
        winter: assumption({
          range: [5.5, 13.1, 29.2],
          unit: "kWh/day",
          direction: "higher",
          source: SOURCES.cenexRefrigeratedTransport,
          note: "Cenex: a trailer TRU needs 13,000 to 32,000 kWh of thermal energy a year at a coefficient of performance of 2.1 to 4.5, so 2,889 to 15,238 kWh of electrical energy, mid value 6,818 kWh (18.7 kWh/day). The summer factor of 1.3 and winter factor of 0.7 are assumptions.",
        }),
      },
      fuelPerKwh: assumption({
        range: [0.34, 0.39, 0.47],
        unit: "L/kWh",
        direction: "higher",
        source: SOURCES.cenexRefrigeratedTransport,
        note: "Cenex assumes a 30% efficient diesel engine and an 85% efficient alternator. Diesel holds 9.97 kWh per litre, so 0.39 L per kWh; 35% and 25% engine efficiency give the pessimistic and optimistic values.",
      }),
    },
    ENGINE_DRIVEN: {
      electricalDemandPerDay: {
        summer: assumption({
          range: [3, 6, 12],
          unit: "kWh/day",
          direction: "higher",
          source: ASSUMED,
          note: "Smaller van or rigid-truck body, about a quarter of a trailer unit. Assumption.",
        }),
        winter: assumption({
          range: [1.5, 3.5, 7],
          unit: "kWh/day",
          direction: "higher",
          source: ASSUMED,
          note: "Smaller van or rigid-truck body, lower winter load. Assumption.",
        }),
      },
      fuelPerKwh: assumption({
        range: [0.3, 0.35, 0.42],
        unit: "L/kWh",
        direction: "higher",
        source: ASSUMED,
        note: "Compressor driven by the vehicle engine without an alternator (30% engine efficiency, 95% belt drive). Derived, assumption.",
      }),
    },
    ELECTRIC: {
      electricalDemandPerDay: {
        summer: assumption({
          range: [4, 8, 14],
          unit: "kWh/day",
          direction: "higher",
          source: ASSUMED,
          note: "Electric unit on a van or small trailer, average duty cycle 40 to 50%. Assumption.",
        }),
        winter: assumption({
          range: [2, 5, 8],
          unit: "kWh/day",
          direction: "higher",
          source: ASSUMED,
          note: "Electric unit, lower winter load. Assumption.",
        }),
      },
      fuelPerKwh: assumption({
        range: [0.34, 0.39, 0.47],
        unit: "L/kWh",
        direction: "higher",
        source: ASSUMED,
        note: "An electric unit draws from the battery, which the alternator recharges, so the alternator figure applies.",
      }),
    },
  },
  idling: {
    fuelPerIdleHour: assumption({
      range: [2.27, 3.03, 5.68],
      unit: "L/h",
      direction: "higher",
      source: SOURCES.afdcIdling,
      note: "Heavy-duty truck idling uses 0.6 to 1.5 US gallons an hour, typically 0.8 (converted at 3.785 L per gallon). Light vehicles use less.",
    }),
    cabClimateDemandKw: assumption({
      range: [0.8, 1.5, 2.5],
      unit: "kW",
      direction: "higher",
      source: ASSUMED,
      note: "Electric power of a cab air conditioner or heater. Assumption.",
    }),
    hoursPerDay: {
      RARELY: assumption({
        range: [0.1, 0.25, 0.5],
        unit: "h/day",
        direction: "higher",
        source: ASSUMED,
        note: "Hours of engine idling per day for this answer. The DOE source cites about 1,800 idle hours a year for long-haul rest periods, which is 4.9 hours a day. Assumption.",
      }),
      SOMETIMES: assumption({
        range: [0.5, 1, 2],
        unit: "h/day",
        direction: "higher",
        source: ASSUMED,
        note: "Hours of engine idling per day for this answer. The DOE source cites about 1,800 idle hours a year for long-haul rest periods, which is 4.9 hours a day. Assumption.",
      }),
      OFTEN: assumption({
        range: [2, 3, 4.9],
        unit: "h/day",
        direction: "higher",
        source: ASSUMED,
        note: "Hours of engine idling per day for this answer. The DOE source cites about 1,800 idle hours a year for long-haul rest periods, which is 4.9 hours a day. Assumption.",
      }),
    },
  },
  batteryBreakdowns: {
    failureRatePerYear: {
      withoutSolar: assumption({
        range: [0.06, 0.1, 0.15],
        unit: "per vehicle per year",
        direction: "higher",
        source: ASSUMED,
        note: "Share of vehicles with a starter-battery breakdown each year. Assumption.",
      }),
      withSolar: assumption({
        range: [0.06, 0.05, 0.03],
        unit: "per vehicle per year",
        direction: "lower",
        source: ASSUMED,
        note: "Same, with a solar panel keeping the battery charged. Never worse than without solar in the same scenario. Assumption.",
      }),
    },
    costPerCallOutEur: assumption({
      range: [150, 250, 400],
      unit: "EUR",
      direction: "higher",
      source: ASSUMED,
      note: "Recovery and lost driver time for one call-out. Assumption.",
    }),
    batteryPriceEur: assumption({
      range: [120, 200, 320],
      unit: "EUR",
      direction: "higher",
      source: ASSUMED,
      note: "Replacement 12 V or 24 V starter battery. Assumption.",
    }),
    batteryLifeYears: {
      withoutSolar: assumption({
        range: [5, 4, 3],
        unit: "years",
        direction: "lower",
        source: ASSUMED,
        note: "Typical starter-battery life in vehicles that stand for long periods. Assumption.",
      }),
      withSolar: assumption({
        range: [5, 6, 7.5],
        unit: "years",
        direction: "higher",
        source: ASSUMED,
        note: "Same, with steady solar trickle charging. Never shorter than without solar in the same scenario. Assumption.",
      }),
    },
  },
  alternator: {
    dieselFuelPerKwh: assumption({
      range: [0.34, 0.39, 0.47],
      unit: "L/kWh",
      direction: "higher",
      source: SOURCES.cenexRefrigeratedTransport,
      note: "Cenex assumes a 30% efficient diesel engine and an 85% efficient alternator. Diesel holds 9.97 kWh per litre, so 0.39 L per kWh; 35% and 25% engine efficiency give the pessimistic and optimistic values.",
    }),
    petrolFuelPerKwh: assumption({
      range: [0.47, 0.53, 0.66],
      unit: "L/kWh",
      direction: "higher",
      source: ASSUMED,
      note: "Petrol holds 8.9 kWh per litre; 28%, 25% and 20% engine efficiency with an 85% alternator (Cenex). Derived, assumption.",
    }),
  },
  placement: {
    ROOF: {
      verticalShare: assumption({
        range: [0, 0, 0],
        unit: "fraction",
        direction: "lower",
        source: ASSUMED,
        note: "Share of the panel area that is vertical (uses the PVGIS vertical yield); the rest is horizontal (PVGIS flat yield). Assumption from vehicle geometry.",
      }),
    },
    SIDES: {
      verticalShare: assumption({
        range: [1, 1, 1],
        unit: "fraction",
        direction: "lower",
        source: ASSUMED,
        note: "Share of the panel area that is vertical (uses the PVGIS vertical yield); the rest is horizontal (PVGIS flat yield). Assumption from vehicle geometry.",
      }),
    },
    BACK: {
      verticalShare: assumption({
        range: [1, 1, 1],
        unit: "fraction",
        direction: "lower",
        source: ASSUMED,
        note: "Share of the panel area that is vertical (uses the PVGIS vertical yield); the rest is horizontal (PVGIS flat yield). Assumption from vehicle geometry.",
      }),
    },
    ALL_OVER: {
      verticalShare: assumption({
        range: [0.6, 0.4, 0.2],
        unit: "fraction",
        direction: "lower",
        source: ASSUMED,
        note: "Share of the panel area that is vertical (uses the PVGIS vertical yield); the rest is horizontal (PVGIS flat yield). Assumption from vehicle geometry.",
      }),
    },
  },
  losses: {
    flatMounting: assumption({
      range: [0.08, 0.05, 0.03],
      unit: "fraction",
      direction: "lower",
      source: ASSUMED,
      note: "Extra loss for curved or ribbed roofs, vehicle movement and random orientation. PVGIS already models horizontal panels. Assumption.",
    }),
    soiling: assumption({
      range: [0.05, 0.03, 0.015],
      unit: "fraction",
      direction: "lower",
      source: ASSUMED,
      note: "Dirt on panels between cleanings. Assumption.",
    }),
    wiring: assumption({
      range: [0.05, 0.03, 0.02],
      unit: "fraction",
      direction: "lower",
      source: ASSUMED,
      note: "Cable and charge-controller losses on top of the 14% system loss already in PVGIS. Assumption.",
    }),
  },
  shading: {
    DEPOT: assumption({
      range: [0.9, 0.95, 0.98],
      unit: "fraction",
      direction: "higher",
      source: ASSUMED,
      note: "Share of the yield left after shading at this parking type. Assumption.",
    }),
    STREET: assumption({
      range: [0.75, 0.85, 0.92],
      unit: "fraction",
      direction: "higher",
      source: ASSUMED,
      note: "Share of the yield left after shading at this parking type. Assumption.",
    }),
    CUSTOMER_SITE: assumption({
      range: [0.75, 0.85, 0.92],
      unit: "fraction",
      direction: "higher",
      source: ASSUMED,
      note: "Share of the yield left after shading at this parking type. Assumption.",
    }),
    MIXED: assumption({
      range: [0.82, 0.9, 0.95],
      unit: "fraction",
      direction: "higher",
      source: ASSUMED,
      note: "Share of the yield left after shading at this parking type. Assumption.",
    }),
  },
  degradation: {
    panelPerYear: assumption({
      range: [0.008, 0.005, 0.003],
      unit: "fraction/year",
      direction: "lower",
      source: SOURCES.nrelPvDegradation,
      note: "Median 0.5% a year and mean 0.8% a year over nearly 2,000 measurements. The optimistic 0.3% is an assumption.",
    }),
    batteryCapacityLossPerYear: assumption({
      range: [0.015, 0.023, 0.03],
      unit: "fraction/year",
      direction: "higher",
      source: SOURCES.geotabBatteryHealth,
      note: "Average 2.3% a year over 22,700 EVs; 1.5% with little fast charging and up to 3% with heavy fast charging.",
    }),
  },
  costs: {
    installedSystemCostPerKwp: assumption({
      range: [3500, 2500, 1800],
      unit: "EUR/kWp",
      direction: "lower",
      source: ASSUMED,
      note: "Installed vehicle-mounted flexible modules with controller. No public price list found. Assumption.",
    }),
    annualMaintenancePerKwp: assumption({
      range: [60, 30, 15],
      unit: "EUR/kWp/year",
      direction: "lower",
      source: ASSUMED,
      note: "Cleaning and inspection. Assumption.",
    }),
  },
  fuelCo2: {
    dieselKgPerLitre: assumption({
      range: [2.689, 2.689, 2.689],
      unit: "kg CO2/L",
      direction: "higher",
      source: SOURCES.epaEquivalencies,
      note: "10.18 kg CO2 per US gallon of diesel divided by 3.785 L. A physical constant, so no scenario range.",
    }),
    petrolKgPerLitre: assumption({
      range: [2.348, 2.348, 2.348],
      unit: "kg CO2/L",
      direction: "higher",
      source: SOURCES.epaEquivalencies,
      note: "8.887 kg CO2 per US gallon of gasoline divided by 3.785 L. A physical constant, so no scenario range.",
    }),
  },
  countries: EU_COUNTRY_DATA,
  cityYields: CITY_YIELDS,
  yieldLocations: [...CAPITAL_YIELD_LOCATIONS, ...EXTRA_CITY_YIELD_LOCATIONS],
};

export type AssumptionSet = typeof ASSUMPTION_SET_V1;
