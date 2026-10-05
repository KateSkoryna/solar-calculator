import { screen } from "@testing-library/react";
import StatTile from "./StatTile";
import { renderWithIntl } from "@/test-support/render-with-intl";

describe("StatTile", () => {
  it("shows the label, value and explanation", () => {
    renderWithIntl(
      <StatTile label="Saved" value="4,200" explanation="A range" />,
    );

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("4,200")).toHaveClass("text-ink");
    expect(screen.getByText("A range")).toBeInTheDocument();
  });

  it("uses the lime value on a dark tile when emphasised", () => {
    renderWithIntl(
      <StatTile label="Gain" value="24,000" explanation="A range" emphasis />,
    );

    expect(screen.getByText("24,000")).toHaveClass("text-lime");
  });

  it("keeps the optional tooltip", () => {
    renderWithIntl(
      <StatTile
        label="Saved"
        value="4,200"
        explanation="A range"
        tooltip="More detail"
      />,
    );

    expect(screen.getByRole("tooltip")).toHaveTextContent("More detail");
  });
});
