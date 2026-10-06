import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalculationHistoryList from "./CalculationHistoryList";
import type { CalculationHistoryRow } from "@/lib/fleet-calculation-history";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const CURRENT_VERSION = "2026.1";
const statusMessages = englishMessages.overview.groups.status;

function row(overrides: Partial<CalculationHistoryRow> = {}) {
  return {
    id: "calc_1",
    name: null,
    manufacturer: "Ford",
    model: "Transit",
    vehicleType: "VAN" as const,
    city: "Berlin",
    quantity: 3,
    createdAt: new Date("2026-03-04T10:00:00Z"),
    assumptionSetVersion: CURRENT_VERSION,
    paybackMonths: 52,
    hasResult: true,
    vehicleEditedAt: null,
    ...overrides,
  };
}

function renderHistory(rows: CalculationHistoryRow[]) {
  return renderWithIntl(
    <CalculationHistoryList
      rows={rows}
      currentAssumptionSetVersion={CURRENT_VERSION}
      locale="en"
      fleetSlug="berlin"
    />,
  );
}

describe("CalculationHistoryList", () => {
  it("links each row to its result", () => {
    renderHistory([row()]);

    expect(screen.getByRole("link", { name: /Ford Transit/ })).toHaveAttribute(
      "href",
      "/en/berlin/calculations/calc_1",
    );
  });

  it("marks a calculation made with current assumptions as calculated", () => {
    renderHistory([row()]);

    const item = screen.getByRole("listitem");
    expect(within(item).getByText(statusMessages.calculated)).toBeVisible();
  });

  it("shows Needs calculation for a stale calculation", () => {
    renderHistory([row({ assumptionSetVersion: "2025.2" })]);

    expect(screen.getByText(statusMessages.needsCalculation)).toBeVisible();
  });

  it("shows the number of vehicles in its own column, not in the name", () => {
    renderHistory([row({ quantity: 12 })]);

    expect(screen.getByText("12")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Ford Transit/ }).textContent,
    ).not.toContain("· 12");
  });

  it("shows Needs calculation when the vehicle was edited after the calculation", () => {
    renderHistory([row({ vehicleEditedAt: new Date("2026-04-01T10:00:00Z") })]);

    expect(screen.getByText(statusMessages.needsCalculation)).toBeVisible();
  });

  it("says when a calculation never pays off", () => {
    renderHistory([row({ paybackMonths: null })]);

    expect(
      screen.getByText(englishMessages.overview.groups.doesNotPayOff),
    ).toBeVisible();
  });

  it("lists rows in the order given", () => {
    renderHistory([
      row({ id: "calc_new", model: "Newest" }),
      row({ id: "calc_old", model: "Oldest" }),
    ]);

    const names = screen
      .getAllByRole("link")
      .map((link) => link.textContent ?? "");
    expect(names[0]).toContain("Newest");
    expect(names[1]).toContain("Oldest");
  });

  it("re-orders the rows with the sort control", async () => {
    renderHistory([
      row({ id: "a", model: "Zeta", paybackMonths: 90 }),
      row({ id: "b", model: "Alpha", paybackMonths: 30 }),
    ]);
    const sortLabel = englishMessages.calculations.history.sort;

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: sortLabel.label }),
      sortLabel.options.vehicle,
    );

    expect(screen.getAllByRole("link")[0].textContent).toContain("Alpha");
  });
});
