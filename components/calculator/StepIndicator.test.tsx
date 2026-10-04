import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StepIndicator from "./StepIndicator";
import { renderWithIntl } from "@/test-support/render-with-intl";

const STEPS = [
  { label: "Vehicles", hint: "Type and number" },
  { label: "Daily driving", hint: "How far they go" },
  { label: "Location", hint: "Where they operate" },
  { label: "Panels", hint: "Where they go" },
];

const CURRENT_STEP_INDEX = 1;

function renderStepIndicator(onStepSelect = jest.fn()) {
  renderWithIntl(
    <StepIndicator
      steps={STEPS}
      currentStepIndex={CURRENT_STEP_INDEX}
      onStepSelect={onStepSelect}
    />,
  );
  return onStepSelect;
}

describe("StepIndicator", () => {
  it("has a text alternative for the current position", () => {
    renderStepIndicator();

    expect(
      within(screen.getByRole("navigation", { name: "Progress" })).getByText(
        "Step 2 of 4: Daily driving",
      ),
    ).toBeInTheDocument();
  });

  it("marks only the current step with aria-current in the rail", () => {
    renderStepIndicator();

    expect(
      screen.getByRole("button", { name: /Daily driving/ }),
    ).toHaveAttribute("aria-current", "step");
    expect(
      screen.getByRole("button", { name: /Vehicles/ }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks the current step in the bars and compact renderings", () => {
    renderStepIndicator();

    expect(screen.getByText("2 · Daily driving").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByText("Step 2 of 4")).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("lets the user go back to a completed step", async () => {
    const handleStepSelect = renderStepIndicator();

    await userEvent.click(screen.getByRole("button", { name: /Vehicles/ }));

    expect(handleStepSelect).toHaveBeenCalledWith(0);
  });

  it("does not let the user jump to an upcoming step", () => {
    renderStepIndicator();

    expect(screen.getByRole("button", { name: /Location/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Panels/ })).toBeDisabled();
  });

  it("makes no step clickable when there is no select handler", () => {
    renderWithIntl(
      <StepIndicator steps={STEPS} currentStepIndex={CURRENT_STEP_INDEX} />,
    );

    expect(screen.getByRole("button", { name: /Vehicles/ })).toBeDisabled();
  });
});
