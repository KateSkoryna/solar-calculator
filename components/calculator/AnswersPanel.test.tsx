import { screen, within } from "@testing-library/react";
import AnswersPanel from "./AnswersPanel";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const calculatorMessages = englishMessages.calculator;

const ANSWERS = [
  { label: "Vehicles", value: "10 × Van" },
  { label: "Daily distance", value: null },
];

function renderAnswersPanel(
  percent: number,
  level: "ROUGH" | "GOOD" | "PRECISE",
) {
  renderWithIntl(
    <AnswersPanel
      answers={ANSWERS}
      accuracy={{ percent, level }}
      summary="10 × Van"
    />,
  );
  return within(
    screen.getByRole("complementary", {
      name: calculatorMessages.answers.title,
    }),
  );
}

describe("AnswersPanel", () => {
  it("shows answered rows and a dash for unanswered ones", () => {
    const panel = renderAnswersPanel(40, "ROUGH");

    expect(panel.getAllByText("10 × Van").length).toBeGreaterThan(0);
    expect(
      panel.getAllByText(calculatorMessages.answers.unanswered).length,
    ).toBeGreaterThan(0);
  });

  it.each([
    [40, "ROUGH", calculatorMessages.accuracy.rough],
    [60, "GOOD", calculatorMessages.accuracy.good],
    [95, "PRECISE", calculatorMessages.accuracy.precise],
  ] as const)(
    "shows the accuracy level for %s %%",
    (percent, level, expectedLabel) => {
      const panel = renderAnswersPanel(percent, level);

      expect(panel.getAllByText(expectedLabel).length).toBeGreaterThan(0);
      expect(panel.getAllByRole("progressbar")[0]).toHaveAttribute(
        "aria-valuenow",
        String(percent),
      );
    },
  );

  it("offers a collapsed summary for the tablet layout", () => {
    const panel = renderAnswersPanel(40, "ROUGH");

    expect(panel.getByText("Your answers · 10 × Van")).toBeInTheDocument();
  });

  it("stops asking for more answers once the estimate is precise", () => {
    const panel = renderAnswersPanel(100, "PRECISE");

    expect(
      panel.queryByText(calculatorMessages.accuracy.helper),
    ).not.toBeInTheDocument();
    expect(
      panel.getAllByText(calculatorMessages.accuracy.preciseHelper).length,
    ).toBeGreaterThan(0);
  });
});
