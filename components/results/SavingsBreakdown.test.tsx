import { screen } from "@testing-library/react";
import SavingsBreakdown from "./SavingsBreakdown";
import { toResultsViewModel } from "@/lib/results-view-model";
import { calculateOutput } from "@/test-support/results-fixtures";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const savingsTypeLabels = englishMessages.results.breakdown.types;

function renderBreakdown(
  inputOverrides: Parameters<typeof calculateOutput>[0],
) {
  const viewModel = toResultsViewModel(calculateOutput(inputOverrides));
  renderWithIntl(<SavingsBreakdown lines={viewModel.savingsBreakdown} />);
  return viewModel.savingsBreakdown;
}

describe("SavingsBreakdown", () => {
  it("shows one line per savings type that applies", () => {
    const lines = renderBreakdown({});

    expect(screen.getAllByRole("listitem")).toHaveLength(lines.length);
    expect(
      screen.queryByText(savingsTypeLabels.COOLING_UNIT_FUEL),
    ).not.toBeInTheDocument();
  });

  it("shows cooling unit fuel for chilled cargo", () => {
    renderBreakdown({ cargoType: "CHILLED", vehicleType: "TRAILER" });

    expect(
      screen.getByText(savingsTypeLabels.COOLING_UNIT_FUEL),
    ).toBeInTheDocument();
  });

  it("always shows battery breakdowns", () => {
    renderBreakdown({});

    expect(
      screen.getByText(savingsTypeLabels.FEWER_BATTERY_BREAKDOWNS),
    ).toBeInTheDocument();
  });
});
