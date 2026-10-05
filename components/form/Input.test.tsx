import { render, screen } from "@testing-library/react";
import Input from "./Input";

const INPUT_LABEL = "City";
const INPUT_HINT = "We use the city to estimate sun hours.";
const INPUT_ERROR = "Please enter a city";

describe("Input", () => {
  it("links the label to the field", () => {
    render(<Input label={INPUT_LABEL} />);

    expect(
      screen.getByRole("textbox", { name: INPUT_LABEL }),
    ).toBeInTheDocument();
  });

  it("is valid and undescribed without hint or error", () => {
    render(<Input label={INPUT_LABEL} />);

    const field = screen.getByRole("textbox", { name: INPUT_LABEL });
    expect(field).not.toHaveAttribute("aria-invalid");
    expect(field).not.toHaveAttribute("aria-describedby");
  });

  it("links the hint through aria-describedby", () => {
    render(<Input label={INPUT_LABEL} hint={INPUT_HINT} />);

    expect(
      screen.getByRole("textbox", { name: INPUT_LABEL }),
    ).toHaveAccessibleDescription(INPUT_HINT);
  });

  it("links hint and error and marks the field invalid", () => {
    render(<Input label={INPUT_LABEL} hint={INPUT_HINT} error={INPUT_ERROR} />);

    const field = screen.getByRole("textbox", { name: INPUT_LABEL });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(`${INPUT_HINT} ${INPUT_ERROR}`);
  });

  it("keeps a description supplied by the caller", () => {
    render(
      <>
        <p id="external-help">External help</p>
        <Input
          label={INPUT_LABEL}
          hint={INPUT_HINT}
          aria-describedby="external-help"
        />
      </>,
    );

    expect(
      screen.getByRole("textbox", { name: INPUT_LABEL }),
    ).toHaveAccessibleDescription(`External help ${INPUT_HINT}`);
  });
});
