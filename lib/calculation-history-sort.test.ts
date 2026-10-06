import { sortCalculationHistory } from "@/lib/calculation-history-sort";
import type { CalculationHistoryRow } from "@/lib/fleet-calculation-history";

function row(
  id: string,
  overrides: Partial<CalculationHistoryRow> = {},
): CalculationHistoryRow {
  return {
    id,
    name: null,
    manufacturer: "Ford",
    model: "Transit",
    vehicleType: "VAN" as const,
    city: "Berlin",
    quantity: 1,
    createdAt: new Date("2026-03-01T10:00:00Z"),
    assumptionSetVersion: "2026.1",
    paybackMonths: 50,
    hasResult: true,
    vehicleEditedAt: null,
    ...overrides,
  };
}

const ids = (rows: CalculationHistoryRow[]) => rows.map(({ id }) => id);

describe("sortCalculationHistory", () => {
  const older = row("older", { createdAt: new Date("2026-01-01T10:00:00Z") });
  const newer = row("newer", { createdAt: new Date("2026-05-01T10:00:00Z") });

  it("sorts by date in both directions", () => {
    expect(ids(sortCalculationHistory([older, newer], "newest"))).toEqual([
      "newer",
      "older",
    ]);
    expect(ids(sortCalculationHistory([newer, older], "oldest"))).toEqual([
      "older",
      "newer",
    ]);
  });

  it("sorts by vehicle name", () => {
    const mercedes = row("m", { manufacturer: "Mercedes", model: "Sprinter" });
    const fiat = row("f", { manufacturer: "Fiat", model: "Ducato" });

    expect(ids(sortCalculationHistory([mercedes, fiat], "vehicle"))).toEqual([
      "f",
      "m",
    ]);
  });

  it("puts the fastest payback first, then never-pays-off, then no result", () => {
    const fast = row("fast", { paybackMonths: 30 });
    const slow = row("slow", { paybackMonths: 90 });
    const never = row("never", { paybackMonths: null });
    const missing = row("missing", { hasResult: false, paybackMonths: null });

    expect(
      ids(sortCalculationHistory([missing, never, slow, fast], "payback")),
    ).toEqual(["fast", "slow", "never", "missing"]);
  });

  it("does not change the original array", () => {
    const rows = [older, newer];
    sortCalculationHistory(rows, "newest");

    expect(ids(rows)).toEqual(["older", "newer"]);
  });
});
