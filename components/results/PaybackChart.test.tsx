import { screen, within } from "@testing-library/react";
import PaybackChart from "./PaybackChart";
import { toResultsViewModel } from "@/lib/results-view-model";
import {
  calculateOutput,
  outputWithRealisticPayback,
  withPaybackMonths,
} from "@/test-support/results-fixtures";
import { renderWithIntl } from "@/test-support/render-with-intl";
import { stubChartEnvironment } from "@/test-support/stub-chart-environment";

const SERIES_COUNT = 3;
const YEAR_ROW_COUNT = 11;

beforeEach(() => {
  stubChartEnvironment();
});

function renderChart(output = calculateOutput()) {
  return renderWithIntl(
    <PaybackChart chart={toResultsViewModel(output).chart} />,
  );
}

describe("PaybackChart", () => {
  it("states the break-even year in the caption", () => {
    renderChart(
      withPaybackMonths(calculateOutput(), {
        PESSIMISTIC: 80,
        REALISTIC: 52,
        OPTIMISTIC: 40,
      }),
    );

    expect(screen.getByRole("figure")).toHaveTextContent(
      /during year 5 — between year 4 and year 7/,
    );
  });

  it("says so when the cost is not passed within ten years", () => {
    renderChart(outputWithRealisticPayback(null));

    expect(screen.getByRole("figure")).toHaveTextContent(
      /do not pass .* within 10 years/,
    );
  });

  it("offers all three series as a table", () => {
    renderChart();

    const table = screen.getByRole("table");
    const [headerRow, ...yearRows] = within(table).getAllByRole("row");

    expect(within(headerRow).getAllByRole("columnheader")).toHaveLength(
      SERIES_COUNT + 1,
    );
    expect(yearRows).toHaveLength(YEAR_ROW_COUNT);
    for (const yearRow of yearRows) {
      expect(within(yearRow).getAllByRole("cell")).toHaveLength(SERIES_COUNT);
    }
  });

  it("names every scenario in the legend", () => {
    renderChart();

    const legend = screen.getAllByRole("list")[0];
    expect(within(legend).getByText("Pessimistic")).toBeInTheDocument();
    expect(within(legend).getByText("Realistic")).toBeInTheDocument();
    expect(within(legend).getByText("Optimistic")).toBeInTheDocument();
  });
});
