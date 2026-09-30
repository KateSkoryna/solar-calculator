import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ParkingType,
  SolarPanelPlacement,
  VehicleType,
} from "@/app/generated/prisma/enums";
import {
  EU_COUNTRY_CODES,
  EU_COUNTRY_DATA,
} from "@/lib/assumptions/eu-countries";
import {
  ASSUMPTION_SOURCE_TITLE,
  COOLING_UNIT_TYPES,
  DISTANCE_BANDS,
  IDLING_FREQUENCIES,
  type Assumption,
} from "@/lib/assumptions/types";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";

const ASSUMPTIONS_DOCUMENT_PATH = path.join(
  process.cwd(),
  "docs",
  "assumptions-v1.md",
);
const EXPECTED_COUNTRY_COUNT = 27;
const DOCUMENT_COLUMN_COUNT = 8;

function isAssumption(value: unknown): value is Assumption {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "sourceTitle" in value
  );
}

function collectAssumptions(
  node: unknown,
  currentPath: string[] = [],
): Map<string, Assumption> {
  const collected = new Map<string, Assumption>();

  if (isAssumption(node)) {
    collected.set(currentPath.join("."), node);
    return collected;
  }

  if (typeof node === "object" && node !== null && !Array.isArray(node)) {
    for (const [key, child] of Object.entries(node)) {
      for (const [childPath, assumption] of collectAssumptions(child, [
        ...currentPath,
        key,
      ])) {
        collected.set(childPath, assumption);
      }
    }
  }

  return collected;
}

const allAssumptions = collectAssumptions(ASSUMPTION_SET_V1);

function parseDocumentRows() {
  const rows = new Map<string, number[]>();

  for (const line of readFileSync(ASSUMPTIONS_DOCUMENT_PATH, "utf8").split(
    "\n",
  )) {
    if (!line.startsWith("| `")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    expect(cells).toHaveLength(DOCUMENT_COLUMN_COUNT);
    const key = cells[0].replaceAll("`", "");
    rows.set(key, [Number(cells[1]), Number(cells[2]), Number(cells[3])]);
  }

  return rows;
}

describe("assumption set v1 structure", () => {
  it("has the version 2026.1", () => {
    expect(ASSUMPTION_SET_V1.version).toBe("2026.1");
  });

  it("has an entry for every vehicle type", () => {
    expect(Object.keys(ASSUMPTION_SET_V1.vehicleTypes).sort()).toEqual(
      Object.values(VehicleType).sort(),
    );
    expect(Object.keys(ASSUMPTION_SET_V1.typicalCoolingUnit).sort()).toEqual(
      Object.values(VehicleType).sort(),
    );
  });

  it("has usable panel capacity for every placement on every vehicle type", () => {
    for (const vehicleType of Object.values(ASSUMPTION_SET_V1.vehicleTypes)) {
      expect(Object.keys(vehicleType.usablePanelCapacityKw).sort()).toEqual(
        Object.values(SolarPanelPlacement).sort(),
      );
    }
    expect(Object.keys(ASSUMPTION_SET_V1.placement).sort()).toEqual(
      Object.values(SolarPanelPlacement).sort(),
    );
  });

  it("has a shading factor for every parking type", () => {
    expect(Object.keys(ASSUMPTION_SET_V1.shading).sort()).toEqual(
      Object.values(ParkingType).sort(),
    );
  });

  it("has entries for every distance band, idling answer and cooling unit", () => {
    expect(Object.keys(ASSUMPTION_SET_V1.distanceBands).sort()).toEqual(
      [...DISTANCE_BANDS].sort(),
    );
    expect(Object.keys(ASSUMPTION_SET_V1.idling.hoursPerDay).sort()).toEqual(
      [...IDLING_FREQUENCIES].sort(),
    );
    expect(Object.keys(ASSUMPTION_SET_V1.coolingUnits).sort()).toEqual(
      [...COOLING_UNIT_TYPES].sort(),
    );
  });

  it("uses only known cooling unit types as typical units", () => {
    for (const coolingUnit of Object.values(
      ASSUMPTION_SET_V1.typicalCoolingUnit,
    )) {
      expect(COOLING_UNIT_TYPES).toContain(coolingUnit);
    }
  });
});

describe("assumption values", () => {
  it("collects a realistic number of assumptions", () => {
    expect(allAssumptions.size).toBeGreaterThan(200);
  });

  it.each([...allAssumptions])(
    "%s has finite, non-negative values ordered by its favourable direction",
    (_assumptionPath, assumption) => {
      const { pessimistic, realistic, optimistic } = assumption.value;

      for (const scenarioValue of [pessimistic, realistic, optimistic]) {
        expect(Number.isFinite(scenarioValue)).toBe(true);
        expect(scenarioValue).toBeGreaterThanOrEqual(0);
      }

      if (assumption.favourableDirection === "higher") {
        expect(pessimistic).toBeLessThanOrEqual(realistic);
        expect(realistic).toBeLessThanOrEqual(optimistic);
      } else {
        expect(pessimistic).toBeGreaterThanOrEqual(realistic);
        expect(realistic).toBeGreaterThanOrEqual(optimistic);
      }
    },
  );

  it.each([...allAssumptions])(
    "%s has a source url or is marked as an assumption with a note",
    (_assumptionPath, assumption) => {
      expect(assumption.unit).not.toBe("");
      expect(assumption.accessedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      if (assumption.sourceTitle === ASSUMPTION_SOURCE_TITLE) {
        expect(assumption.note ?? "").not.toBe("");
      } else {
        expect(assumption.sourceUrl).toMatch(/^https:\/\//);
      }
    },
  );
});

describe("battery breakdown pairing", () => {
  const { failureRatePerYear, batteryLifeYears } =
    ASSUMPTION_SET_V1.batteryBreakdowns;
  const scenarios = ["pessimistic", "realistic", "optimistic"] as const;

  it.each(scenarios)(
    "never makes solar worse than no solar in the %s scenario",
    (scenario) => {
      expect(failureRatePerYear.withSolar.value[scenario]).toBeLessThanOrEqual(
        failureRatePerYear.withoutSolar.value[scenario],
      );
      expect(batteryLifeYears.withSolar.value[scenario]).toBeGreaterThanOrEqual(
        batteryLifeYears.withoutSolar.value[scenario],
      );
    },
  );
});

describe("city yields", () => {
  it("matches the capital yield of the same city in the country table", () => {
    expect(ASSUMPTION_SET_V1.cityYields.Berlin).toBe(
      EU_COUNTRY_DATA.DE.capitalYield,
    );
    expect(ASSUMPTION_SET_V1.cityYields.Vienna).toBe(
      EU_COUNTRY_DATA.AT.capitalYield,
    );
  });
});

describe("yield locations", () => {
  it("lists every capital and the five extra cities with valid coordinates", () => {
    expect(ASSUMPTION_SET_V1.yieldLocations).toHaveLength(
      EU_COUNTRY_CODES.length + 5,
    );
    for (const location of ASSUMPTION_SET_V1.yieldLocations) {
      expect(EU_COUNTRY_CODES).toContain(location.countryCode);
      expect(Math.abs(location.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(location.longitude)).toBeLessThanOrEqual(180);
    }
  });
});

describe("EU country data", () => {
  it("lists the 27 member states once each", () => {
    expect(EU_COUNTRY_CODES).toHaveLength(EXPECTED_COUNTRY_COUNT);
    expect(new Set(EU_COUNTRY_CODES).size).toBe(EXPECTED_COUNTRY_COUNT);
  });

  it.each([...EU_COUNTRY_CODES])(
    "%s has complete country data",
    (countryCode) => {
      const country = EU_COUNTRY_DATA[countryCode];

      expect(country.capital).not.toBe("");
      expect(isAssumption(country.dieselPricePerLitre)).toBe(true);
      expect(isAssumption(country.petrolPricePerLitre)).toBe(true);
      expect(isAssumption(country.electricityPricePerKwh)).toBe(true);
      expect(isAssumption(country.gridCo2FactorKgPerKwh)).toBe(true);
      expect(isAssumption(country.capitalYield.flat)).toBe(true);
      expect(isAssumption(country.capitalYield.vertical)).toBe(true);
      expect(Array.isArray(country.subsidies)).toBe(true);
    },
  );

  it("has flat yield above vertical yield in every capital", () => {
    for (const code of EU_COUNTRY_CODES) {
      const { flat, vertical } = EU_COUNTRY_DATA[code].capitalYield;
      expect(flat.value.realistic).toBeGreaterThan(vertical.value.realistic);
    }
  });
});

describe("docs/assumptions-v1.md", () => {
  const documentRows = parseDocumentRows();

  it("has exactly the assumption paths of ASSUMPTION_SET_V1 as keys", () => {
    expect([...documentRows.keys()].sort()).toEqual(
      [...allAssumptions.keys()].sort(),
    );
  });

  it("shows the same three values as the code for every row", () => {
    for (const [assumptionPath, assumption] of allAssumptions) {
      const [pessimistic, realistic, optimistic] =
        documentRows.get(assumptionPath) ?? [];
      expect(pessimistic).toBeCloseTo(assumption.value.pessimistic, 6);
      expect(realistic).toBeCloseTo(assumption.value.realistic, 6);
      expect(optimistic).toBeCloseTo(assumption.value.optimistic, 6);
    }
  });
});
