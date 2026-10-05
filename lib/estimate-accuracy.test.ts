import type { InputSources } from "@/lib/calculation-engine/types";
import {
  accuracyLevelForPercent,
  ESTIMATE_ACCURACY_LEVELS,
  estimateAccuracy,
} from "./estimate-accuracy";

describe("accuracyLevelForPercent", () => {
  it.each([
    [0, "ROUGH"],
    [49, "ROUGH"],
    [49.9, "ROUGH"],
    [50, "GOOD"],
    [89, "GOOD"],
    [89.9, "GOOD"],
    [90, "PRECISE"],
    [100, "PRECISE"],
  ] as const)("maps %s %% to %s", (percent, expectedLevel) => {
    expect(accuracyLevelForPercent(percent)).toBe(expectedLevel);
  });

  it("lists the levels from lowest to highest threshold", () => {
    const thresholds = ESTIMATE_ACCURACY_LEVELS.map(
      ({ minimumPercent }) => minimumPercent,
    );

    expect(thresholds).toEqual([...thresholds].sort((a, b) => a - b));
  });
});

describe("estimateAccuracy", () => {
  it("is rough with zero percent when there are no inputs", () => {
    expect(estimateAccuracy({})).toEqual({ percent: 0, level: "ROUGH" });
  });

  it("counts presets as zero", () => {
    const sources: InputSources = {
      energyConsumptionKwhPer100km: "PRESET",
      solarPanelCapacityKw: "PRESET",
    };

    expect(estimateAccuracy(sources)).toEqual({ percent: 0, level: "ROUGH" });
  });

  it("counts provided and measured inputs fully", () => {
    const sources: InputSources = {
      vehicleType: "PROVIDED",
      averageDailyDistanceKm: "MEASURED",
    };

    expect(estimateAccuracy(sources)).toEqual({
      percent: 100,
      level: "PRECISE",
    });
  });

  it("is rough when fewer than half of the inputs are answered", () => {
    const sources: InputSources = {
      vehicleType: "PROVIDED",
      energyConsumptionKwhPer100km: "PRESET",
      solarPanelCapacityKw: "PRESET",
    };

    expect(estimateAccuracy(sources).level).toBe("ROUGH");
  });

  it("is good when exactly half of the inputs are answered", () => {
    const sources: InputSources = {
      vehicleType: "PROVIDED",
      quantity: "MEASURED",
      energyConsumptionKwhPer100km: "PRESET",
      solarPanelCapacityKw: "PRESET",
    };

    expect(estimateAccuracy(sources)).toEqual({ percent: 50, level: "GOOD" });
  });

  it("is precise when nine of ten inputs are answered", () => {
    const sources: InputSources = {
      vehicleType: "PROVIDED",
      engineType: "PROVIDED",
      parkingType: "PROVIDED",
      solarPanelPlacement: "PROVIDED",
      cargoType: "PROVIDED",
      quantity: "PROVIDED",
      averageDailyDistanceKm: "MEASURED",
      operatingMonthsPerYear: "PROVIDED",
      countryCode: "PROVIDED",
      maxRoofLoadKg: "PRESET",
    };

    expect(estimateAccuracy(sources)).toEqual({
      percent: 90,
      level: "PRECISE",
    });
  });
});
