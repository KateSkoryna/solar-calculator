import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NumberStepper, {
  DEFAULT_STEPPER_MAXIMUM,
  DEFAULT_STEPPER_MINIMUM,
} from "./NumberStepper";

const STEPPER_LABEL = "How many?";
const DECREASE_LABEL = "Fewer vehicles";
const INCREASE_LABEL = "More vehicles";
const RANGE_ERROR = "Please enter a number from 1 to 999";

function ControlledNumberStepper({
  initialValue,
  onChange,
}: {
  initialValue: number;
  onChange?: (value: number) => void;
}) {
  const [quantity, setQuantity] = useState(initialValue);

  return (
    <NumberStepper
      label={STEPPER_LABEL}
      value={quantity}
      decreaseLabel={DECREASE_LABEL}
      increaseLabel={INCREASE_LABEL}
      rangeErrorMessage={RANGE_ERROR}
      onChange={(nextQuantity) => {
        setQuantity(nextQuantity);
        onChange?.(nextQuantity);
      }}
    />
  );
}

function getControls() {
  return {
    field: screen.getByRole("textbox", { name: STEPPER_LABEL }),
    decreaseButton: screen.getByRole("button", { name: DECREASE_LABEL }),
    increaseButton: screen.getByRole("button", { name: INCREASE_LABEL }),
  };
}

describe("NumberStepper", () => {
  it("disables the minus button at the minimum", () => {
    render(<ControlledNumberStepper initialValue={DEFAULT_STEPPER_MINIMUM} />);
    const { decreaseButton, increaseButton } = getControls();

    expect(decreaseButton).toBeDisabled();
    expect(increaseButton).toBeEnabled();
  });

  it("disables the plus button at the maximum", () => {
    render(<ControlledNumberStepper initialValue={DEFAULT_STEPPER_MAXIMUM} />);
    const { decreaseButton, increaseButton } = getControls();

    expect(increaseButton).toBeDisabled();
    expect(decreaseButton).toBeEnabled();
  });

  it("steps up and down with the buttons", async () => {
    const handleChange = jest.fn();
    render(
      <ControlledNumberStepper initialValue={10} onChange={handleChange} />,
    );
    const { field, decreaseButton, increaseButton } = getControls();

    await userEvent.click(increaseButton);
    expect(field).toHaveValue("11");

    await userEvent.click(decreaseButton);
    await userEvent.click(decreaseButton);
    expect(field).toHaveValue("9");
    expect(handleChange).toHaveBeenLastCalledWith(9);
  });

  it("accepts a typed number inside the range", async () => {
    const handleChange = jest.fn();
    render(
      <ControlledNumberStepper initialValue={10} onChange={handleChange} />,
    );
    const { field } = getControls();

    await userEvent.clear(field);
    await userEvent.type(field, "25");

    expect(handleChange).toHaveBeenLastCalledWith(25);
    expect(field).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText(RANGE_ERROR)).not.toBeInTheDocument();
  });

  it.each(["0", "1000", "abc", "2.5"])(
    "shows an error and keeps the last valid value when %s is typed",
    async (typedText) => {
      const handleChange = jest.fn();
      render(
        <ControlledNumberStepper initialValue={10} onChange={handleChange} />,
      );
      const { field } = getControls();

      await userEvent.clear(field);
      handleChange.mockClear();
      await userEvent.type(field, typedText);

      expect(screen.getByRole("alert")).toHaveTextContent(RANGE_ERROR);
      expect(field).toHaveAttribute("aria-invalid", "true");
      expect(field).toHaveAccessibleDescription(RANGE_ERROR);
      expect(handleChange).not.toHaveBeenCalledWith(Number(typedText));
    },
  );

  it("restores the last valid value when the field loses focus", async () => {
    render(<ControlledNumberStepper initialValue={10} />);
    const { field } = getControls();

    await userEvent.clear(field);
    await userEvent.type(field, "1000");
    await userEvent.tab();

    expect(field).toHaveValue("100");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not submit the form with Enter while the typed value is invalid", async () => {
    const handleSubmit = jest.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={handleSubmit}>
        <ControlledNumberStepper initialValue={10} />
        <button type="submit">Continue</button>
      </form>,
    );
    const { field } = getControls();

    await userEvent.clear(field);
    await userEvent.type(field, "1500{Enter}");
    expect(handleSubmit).not.toHaveBeenCalled();

    await userEvent.clear(field);
    await userEvent.type(field, "15{Enter}");
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
