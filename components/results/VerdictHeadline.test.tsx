import { screen } from "@testing-library/react";
import VerdictHeadline from "./VerdictHeadline";
import { toResultsViewModel } from "@/lib/results-view-model";
import {
  calculateOutput,
  outputWithRealisticPayback,
  withPaybackMonths,
} from "@/test-support/results-fixtures";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const verdictMessages = englishMessages.results.verdict;

function renderVerdict(output: ReturnType<typeof calculateOutput>) {
  renderWithIntl(
    <VerdictHeadline verdict={toResultsViewModel(output).verdict} />,
  );
  return screen.getByRole("heading", { level: 1 });
}

describe("VerdictHeadline", () => {
  it("says yes with the humanised duration and the range", () => {
    const headline = renderVerdict(
      withPaybackMonths(calculateOutput(), {
        PESSIMISTIC: 80,
        REALISTIC: 52,
        OPTIMISTIC: 40,
      }),
    );

    expect(headline).toHaveTextContent(/^Yes — solar pays for itself/);
    expect(headline).toHaveTextContent("4 years 4 months");
    expect(headline.lastElementChild).toHaveTextContent(/^4 years 4 months\.$/);
    expect(headline.lastElementChild).toHaveClass("block");
    expect(
      screen.getByText(
        "Between 3 years 4 months and 6 years 8 months, depending on sun and prices.",
      ),
    ).toBeInTheDocument();
  });

  it("says solar pays off slowly after ten years", () => {
    const headline = renderVerdict(outputWithRealisticPayback(150));

    expect(headline).toHaveTextContent(/^Solar pays off slowly/);
    expect(headline).toHaveTextContent("12 years 6 months");
  });

  it("says solar is unlikely to pay off and suggests what to try", () => {
    const headline = renderVerdict(outputWithRealisticPayback(null));

    expect(headline).toHaveTextContent(verdictMessages.UNLIKELY);
    expect(
      screen.getByText(verdictMessages.unlikelySuggestion),
    ).toBeInTheDocument();
  });
});
