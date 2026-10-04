import {
  CALCULATOR_DEFAULT_VALUES,
  CALCULATOR_STEP_FIELDS,
  CALCULATOR_STEP_KEYS,
  calculatorFormSchema,
  calculatorInputSources,
  toQuickCheckAnswers,
  type CalculatorFormValues,
} from "./calculator-form";
import {
  CALCULATOR_ANSWERS_STORAGE_KEY,
  readCalculatorAnswers,
  saveCalculatorAnswers,
} from "./calculator-storage";
import { estimateAccuracy } from "./estimate-accuracy";

const BERLIN = {
  label: "Berlin, Germany",
  countryCode: "DE" as const,
  latitude: 52.52,
  longitude: 13.405,
};

const VALUES_WITH_CITY: CalculatorFormValues = {
  ...CALCULATOR_DEFAULT_VALUES,
  city: BERLIN,
};

describe("calculator defaults", () => {
  it("are Van, 1, regular goods, regional, rarely, depot and roof with no city", () => {
    expect(CALCULATOR_DEFAULT_VALUES).toMatchObject({
      vehicleType: "VAN",
      quantity: 1,
      cargoType: "REGULAR",
      distanceBand: "REGIONAL",
      idlingFrequency: "RARELY",
      parkingType: "DEPOT",
      solarPanelPlacement: "ROOF",
      city: null,
    });
  });

  it("pass the form schema", () => {
    expect(
      calculatorFormSchema.safeParse(CALCULATOR_DEFAULT_VALUES).success,
    ).toBe(true);
  });

  it("assign every form field to exactly one step", () => {
    const assignedFields = CALCULATOR_STEP_KEYS.flatMap(
      (stepKey) => CALCULATOR_STEP_FIELDS[stepKey],
    );

    expect([...assignedFields].sort()).toEqual(
      Object.keys(calculatorFormSchema.shape).sort(),
    );
  });
});

describe("toQuickCheckAnswers", () => {
  it("returns null without a city", () => {
    expect(toQuickCheckAnswers(CALCULATOR_DEFAULT_VALUES)).toBeNull();
  });

  it("flattens the city into the quick check answers", () => {
    expect(toQuickCheckAnswers(VALUES_WITH_CITY)).toEqual({
      vehicleType: "VAN",
      quantity: 1,
      cargoType: "REGULAR",
      distanceBand: "REGIONAL",
      idlingFrequency: "RARELY",
      parkingType: "DEPOT",
      solarPanelPlacement: "ROOF",
      cityLabel: "Berlin, Germany",
      countryCode: "DE",
      latitude: 52.52,
      longitude: 13.405,
    });
  });

  it("keeps exact numbers the user entered", () => {
    expect(
      toQuickCheckAnswers({ ...VALUES_WITH_CITY, averageDailyDistanceKm: 80 }),
    ).toMatchObject({ averageDailyDistanceKm: 80 });
  });

  it("sends the cooling unit only for chilled cargo with a known unit", () => {
    expect(
      toQuickCheckAnswers({
        ...VALUES_WITH_CITY,
        cargoType: "CHILLED",
        coolingUnitType: "DIESEL",
      }),
    ).toMatchObject({ coolingUnitType: "DIESEL" });
    expect(
      toQuickCheckAnswers({ ...VALUES_WITH_CITY, cargoType: "CHILLED" }),
    ).not.toHaveProperty("coolingUnitType");
    expect(
      toQuickCheckAnswers({ ...VALUES_WITH_CITY, coolingUnitType: "DIESEL" }),
    ).not.toHaveProperty("coolingUnitType");
  });
});

describe("calculatorInputSources", () => {
  it("is rough on the defaults and good once a city is chosen", () => {
    expect(
      estimateAccuracy(calculatorInputSources(CALCULATOR_DEFAULT_VALUES)).level,
    ).toBe("ROUGH");
    expect(
      estimateAccuracy(calculatorInputSources(VALUES_WITH_CITY)).level,
    ).toBe("GOOD");
  });

  it("is precise when every exact number is filled in", () => {
    const sources = calculatorInputSources({
      ...VALUES_WITH_CITY,
      averageDailyDistanceKm: 80,
      idleHoursPerDay: 1,
      energyConsumptionKwhPer100km: 28,
      operatingMonthsPerYear: 12,
      solarPanelCapacityKw: 1.2,
      maxRoofLoadKg: 150,
      payloadReserveKg: 300,
    });

    expect(estimateAccuracy(sources)).toEqual({
      percent: 100,
      level: "PRECISE",
    });
  });

  it("counts the cooling unit only for chilled cargo", () => {
    expect(calculatorInputSources(VALUES_WITH_CITY)).not.toHaveProperty(
      "coolingUnitType",
    );
    expect(
      calculatorInputSources({ ...VALUES_WITH_CITY, cargoType: "CHILLED" }),
    ).toMatchObject({ coolingUnitType: "PRESET" });
  });
});

describe("calculator answer storage", () => {
  beforeEach(() => sessionStorage.clear());

  it("round-trips the answers through sessionStorage", () => {
    expect(saveCalculatorAnswers(VALUES_WITH_CITY)).toBe(true);
    expect(readCalculatorAnswers()).toEqual(VALUES_WITH_CITY);
  });

  it("returns null when nothing is stored", () => {
    expect(readCalculatorAnswers()).toBeNull();
  });

  it("treats tampered or malformed data as nothing stored", () => {
    sessionStorage.setItem(CALCULATOR_ANSWERS_STORAGE_KEY, '{"quantity":-5}');
    expect(readCalculatorAnswers()).toBeNull();

    sessionStorage.setItem(CALCULATOR_ANSWERS_STORAGE_KEY, "not json");
    expect(readCalculatorAnswers()).toBeNull();
  });

  it("does not throw when storage is blocked", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(saveCalculatorAnswers(VALUES_WITH_CITY)).toBe(false);
    expect(readCalculatorAnswers()).toBeNull();
    jest.restoreAllMocks();
  });
});
