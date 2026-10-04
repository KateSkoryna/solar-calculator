import { render, screen } from "@testing-library/react";
import ProgressBar from "./ProgressBar";

const PROGRESS_LABEL = "Drawing charts… step 4 of 6";

describe("ProgressBar", () => {
  it("exposes its value, range and visible label", () => {
    render(<ProgressBar value={4} max={6} label={PROGRESS_LABEL} />);

    const progressBar = screen.getByRole("progressbar", {
      name: PROGRESS_LABEL,
    });
    expect(progressBar).toHaveAttribute("aria-valuenow", "4");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "6");
    expect(screen.getByText(PROGRESS_LABEL)).toBeVisible();
  });

  it("clamps values above the maximum", () => {
    render(<ProgressBar value={150} label={PROGRESS_LABEL} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("clamps values below zero", () => {
    render(<ProgressBar value={-5} tone="step" label={PROGRESS_LABEL} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("shows no progress when the maximum is not positive", () => {
    render(<ProgressBar value={3} max={0} label={PROGRESS_LABEL} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });
});
