import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "@/lib/button-styles";

const BUTTON_LABEL = "Save";

describe("Button", () => {
  it("renders a button of type button by default", () => {
    render(<Button>{BUTTON_LABEL}</Button>);

    expect(screen.getByRole("button", { name: BUTTON_LABEL })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it.each(BUTTON_VARIANTS)("renders the %s variant", (variant) => {
    render(<Button variant={variant}>{BUTTON_LABEL}</Button>);

    expect(
      screen.getByRole("button", { name: BUTTON_LABEL }),
    ).toBeInTheDocument();
  });

  it.each(BUTTON_SIZES)("renders the %s size", (size) => {
    render(<Button size={size}>{BUTTON_LABEL}</Button>);

    expect(
      screen.getByRole("button", { name: BUTTON_LABEL }),
    ).toBeInTheDocument();
  });

  it("is busy and keeps its label while loading", () => {
    render(<Button loading>{BUTTON_LABEL}</Button>);

    const button = screen.getByRole("button", { name: BUTTON_LABEL });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
  });

  it("is not busy when it is not loading", () => {
    render(<Button>{BUTTON_LABEL}</Button>);

    expect(
      screen.getByRole("button", { name: BUTTON_LABEL }),
    ).not.toHaveAttribute("aria-busy");
  });

  it("is disabled and ignores clicks when disabled", async () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        {BUTTON_LABEL}
      </Button>,
    );

    const button = screen.getByRole("button", { name: BUTTON_LABEL });
    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("calls onClick when pressed", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>{BUTTON_LABEL}</Button>);

    await userEvent.click(screen.getByRole("button", { name: BUTTON_LABEL }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("replaces the icon with a spinner while loading", () => {
    render(
      <Button loading icon={<svg data-testid="button-icon" />}>
        {BUTTON_LABEL}
      </Button>,
    );

    expect(screen.queryByTestId("button-icon")).not.toBeInTheDocument();
  });
});
