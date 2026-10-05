import { createTranslator } from "next-intl";
import {
  formatDuration,
  humaniseDuration,
  storedCalculationToEngineOutput,
  toResultsViewModel,
} from "@/lib/results-view-model";
import {
  IncompleteStoredCalculationError,
  toProvenanceDetails,
} from "@/lib/stored-calculation";
import { SAVINGS_TYPES } from "@/lib/calculation-engine/types";
import englishMessages from "@/messages/en.json";
import {
  calculateOutput,
  outputWithRealisticPayback,
  toStoredCalculation,
  withPaybackMonths,
} from "@/test-support/results-fixtures";

const translateDuration = createTranslator({
  locale: "en",
  messages: englishMessages,
  namespace: "results.duration",
});

function longDuration(totalMonths: number) {
  return formatDuration(humaniseDuration(totalMonths), "long", (key, values) =>
    translateDuration(key as never, values as never),
  );
}

describe("toResultsViewModel verdict", () => {
  it.each([
    [1, "PAYS_OFF"],
    [52, "PAYS_OFF"],
    [120, "PAYS_OFF"],
    [121, "SLOWLY"],
    [300, "SLOWLY"],
    [null, "UNLIKELY"],
  ])("maps a payback of %s months to %s", (paybackMonths, variant) => {
    const viewModel = toResultsViewModel(
      outputWithRealisticPayback(paybackMonths),
    );

    expect(viewModel.verdict.variant).toBe(variant);
  });

  it("has no duration when solar never pays off", () => {
    const viewModel = toResultsViewModel(outputWithRealisticPayback(null));

    expect(viewModel.verdict.duration).toBeNull();
    expect(viewModel.chart.breakEvenYear).toBeNull();
  });

  it("takes the range from the optimistic and pessimistic scenarios", () => {
    const viewModel = toResultsViewModel(
      withPaybackMonths(calculateOutput(), {
        PESSIMISTIC: 80,
        REALISTIC: 52,
        OPTIMISTIC: 40,
      }),
    );

    expect(viewModel.verdict.duration).toEqual({ years: 4, months: 4 });
    expect(viewModel.verdict.range).toEqual({
      shortest: { years: 3, months: 4 },
      longest: { years: 6, months: 8 },
    });
  });

  it("keeps the best case when the pessimistic scenario never pays off", () => {
    const viewModel = toResultsViewModel(
      withPaybackMonths(calculateOutput(), {
        PESSIMISTIC: null,
        REALISTIC: 200,
        OPTIMISTIC: 90,
      }),
    );

    expect(viewModel.verdict.range).toEqual({
      shortest: { years: 7, months: 6 },
      longest: null,
    });
  });

  it("drops the range when both ends are the same", () => {
    const viewModel = toResultsViewModel(outputWithRealisticPayback(52));

    expect(viewModel.verdict.range).toBeNull();
  });
});

describe("duration humanising", () => {
  it("turns 52 months into 4 years 4 months", () => {
    expect(longDuration(52)).toBe("4 years 4 months");
  });

  it("uses singular forms", () => {
    expect(longDuration(13)).toBe("1 year 1 month");
  });

  it("leaves out empty parts", () => {
    expect(longDuration(48)).toBe("4 years");
    expect(longDuration(7)).toBe("7 months");
  });

  it("rounds to whole months and never shows zero", () => {
    expect(humaniseDuration(52.4)).toEqual({ years: 4, months: 4 });
    expect(humaniseDuration(0)).toEqual({ years: 0, months: 1 });
  });
});

describe("toResultsViewModel numbers", () => {
  const output = calculateOutput();
  const viewModel = toResultsViewModel(output, { distanceBand: "REGIONAL" });

  it("gives every tile a realistic value inside its range", () => {
    for (const tile of Object.values(viewModel.tiles)) {
      expect(tile.low).toBeLessThanOrEqual(tile.realistic);
      expect(tile.realistic).toBeLessThanOrEqual(tile.high);
    }
    expect(viewModel.tiles.annualSavingsEuros.realistic).toBe(
      output.scenarios.REALISTIC.annualSavingsCents / 100,
    );
    expect(viewModel.tiles.oneTimeCostEuros.realistic).toBe(
      output.scenarios.REALISTIC.oneTimeCostAfterSubsidyCents / 100,
    );
  });

  it("builds eleven chart points that start at zero savings", () => {
    expect(viewModel.chart.points).toHaveLength(11);
    expect(viewModel.chart.points[0]).toEqual({
      year: 0,
      PESSIMISTIC: 0,
      REALISTIC: 0,
      OPTIMISTIC: 0,
    });
  });

  it("puts the break-even year after the payback month", () => {
    const paidBackInYearFive = toResultsViewModel(
      withPaybackMonths(output, {
        PESSIMISTIC: 80,
        REALISTIC: 52,
        OPTIMISTIC: 40,
      }),
    );

    expect(paidBackInYearFive.chart.breakEvenYear).toBe(5);
    expect(paidBackInYearFive.chart.breakEvenYearRange).toEqual({
      earliest: 4,
      latest: 7,
    });
    expect(paidBackInYearFive.chart.breakEvenPoints).toHaveLength(3);
  });

  it("always lists battery breakdowns and skips savings that do not apply", () => {
    const types = viewModel.savingsBreakdown.map((line) => line.type);

    expect(types).toContain("FEWER_BATTERY_BREAKDOWNS");
    expect(types).not.toContain("COOLING_UNIT_FUEL");
    for (const type of SAVINGS_TYPES) {
      const applies = output.scenarios.REALISTIC.savingsByTypeCents[type] > 0;
      if (applies) expect(types).toContain(type);
    }
  });

  it("lists every input with its source", () => {
    expect(viewModel.inputs.map((input) => input.key).sort()).toEqual(
      Object.keys(output.inputSources).sort(),
    );
    expect(
      viewModel.inputs.find((input) => input.key === "solarPanelCapacityKw"),
    ).toMatchObject({ source: "PRESET", kind: "number" });
  });

  it("carries the versions and the context", () => {
    expect(viewModel.formulaVersion).toBe(output.formulaVersion);
    expect(viewModel.assumptionSetVersion).toBe(output.assumptionSetVersion);
    expect(viewModel.summary.distanceBand).toBe("REGIONAL");
  });
});

describe("storedCalculationToEngineOutput", () => {
  it.each([
    ["a plain van", {}],
    ["a chilled trailer", { vehicleType: "TRAILER", cargoType: "CHILLED" }],
    ["a fleet that never pays off", { averageDailyDistanceKm: 1 }],
  ] as const)(
    "gives the same screen for %s as the live calculation",
    (_, inputOverrides) => {
      const output = calculateOutput(inputOverrides);

      const fromStored = toResultsViewModel(
        storedCalculationToEngineOutput(toStoredCalculation(output)),
      );

      expect(fromStored).toEqual(toResultsViewModel(output));
    },
  );

  it("does not depend on the order the database returns scenarios in", () => {
    const output = calculateOutput();
    const stored = toStoredCalculation(output);

    const fromReversed = toResultsViewModel(
      storedCalculationToEngineOutput({
        ...stored,
        scenarios: [...stored.scenarios].reverse(),
      }),
    );

    expect(fromReversed).toEqual(toResultsViewModel(output));
  });

  it("refuses a calculation with a missing scenario", () => {
    const stored = toStoredCalculation(calculateOutput());

    expect(() =>
      storedCalculationToEngineOutput({
        ...stored,
        scenarios: stored.scenarios.slice(1),
      }),
    ).toThrow(IncompleteStoredCalculationError);
  });

  it("refuses a scenario that has no result yet", () => {
    const stored = toStoredCalculation(calculateOutput());

    expect(() =>
      storedCalculationToEngineOutput({
        ...stored,
        scenarios: stored.scenarios.map((scenario) => ({
          ...scenario,
          result: null,
        })),
      }),
    ).toThrow(IncompleteStoredCalculationError);
  });

  it("refuses an unreadable input snapshot", () => {
    const stored = toStoredCalculation(calculateOutput());

    expect(() =>
      storedCalculationToEngineOutput({
        ...stored,
        scenarios: stored.scenarios.map((scenario) => ({
          ...scenario,
          inputSnapshot: scenario.inputSnapshot && {
            ...scenario.inputSnapshot,
            vehicleSpec: "not an object",
          },
        })),
      }),
    ).toThrow(IncompleteStoredCalculationError);
  });
});

describe("toProvenanceDetails", () => {
  it("names who calculated and which assumptions were used", () => {
    const output = calculateOutput();

    expect(toProvenanceDetails(toStoredCalculation(output))).toMatchObject({
      requestedBy: "Mira Hoffmann",
      energyPriceVersion: output.assumptionSetVersion,
      currencyConversionVersion: output.assumptionSetVersion,
    });
  });

  it("falls back to the email when the person has no name", () => {
    const stored = toStoredCalculation(calculateOutput());

    expect(
      toProvenanceDetails({
        ...stored,
        requestedByUser: { name: null, email: "mira@example.com" },
      }).requestedBy,
    ).toBe("mira@example.com");
  });
});
