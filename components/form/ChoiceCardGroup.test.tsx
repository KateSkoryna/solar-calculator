import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Controller, useForm } from "react-hook-form";
import ChoiceCardGroup from "./ChoiceCardGroup";
import type { ChoiceOption } from "@/lib/choice-option";

type SampleVehicle = "VAN" | "TRUCK" | "BUS";

const GROUP_LABEL = "What kind of vehicles do you have?";

const VEHICLE_OPTIONS: ChoiceOption<SampleVehicle>[] = [
  { value: "VAN", label: "Van", hint: "Sprinter, Transit" },
  { value: "TRUCK", label: "Truck", hint: "Actros, FH16", sunRating: 2 },
  { value: "BUS", label: "Bus", icon: <svg data-testid="bus-icon" /> },
];

function ControlledChoiceCardGroup({
  onChange,
}: {
  onChange?: (value: SampleVehicle) => void;
}) {
  const [selectedVehicle, setSelectedVehicle] = useState<SampleVehicle>("VAN");

  return (
    <ChoiceCardGroup
      name="vehicle"
      label={GROUP_LABEL}
      options={VEHICLE_OPTIONS}
      value={selectedVehicle}
      onChange={(vehicle) => {
        setSelectedVehicle(vehicle);
        onChange?.(vehicle);
      }}
    />
  );
}

function VehicleForm({
  onSubmit,
}: {
  onSubmit: (values: { vehicle: SampleVehicle }) => void;
}) {
  const { control, handleSubmit } = useForm<{ vehicle: SampleVehicle }>({
    defaultValues: { vehicle: "VAN" },
  });

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))}>
      <Controller
        control={control}
        name="vehicle"
        render={({ field }) => (
          <ChoiceCardGroup
            name={field.name}
            label={GROUP_LABEL}
            options={VEHICLE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <button type="submit">Continue</button>
    </form>
  );
}

describe("ChoiceCardGroup", () => {
  it("is a named radio group", () => {
    render(<ControlledChoiceCardGroup />);

    expect(
      screen.getByRole("radiogroup", { name: GROUP_LABEL }),
    ).toBeInTheDocument();
  });

  it("can be named by another element", () => {
    render(
      <>
        <h1 id="question">{GROUP_LABEL}</h1>
        <ChoiceCardGroup
          name="vehicle"
          labelledBy="question"
          options={VEHICLE_OPTIONS}
          value={null}
          onChange={jest.fn()}
        />
      </>,
    );

    expect(
      screen.getByRole("radiogroup", { name: GROUP_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /van/i })).not.toBeChecked();
  });

  it("selects a card when it is clicked", async () => {
    const handleChange = jest.fn();
    render(<ControlledChoiceCardGroup onChange={handleChange} />);

    await userEvent.click(screen.getByRole("radio", { name: /truck/i }));

    expect(screen.getByRole("radio", { name: /truck/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /van/i })).not.toBeChecked();
    expect(handleChange).toHaveBeenCalledWith("TRUCK");
  });

  it("moves the selection with ArrowRight and ArrowDown", async () => {
    render(<ControlledChoiceCardGroup />);
    const vanRadio = screen.getByRole("radio", { name: /van/i });
    expect(vanRadio).toBeChecked();

    vanRadio.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: /truck/i })).toBeChecked();

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: /bus/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /bus/i })).toHaveFocus();
  });

  it("moves the selection back with ArrowLeft", async () => {
    render(<ControlledChoiceCardGroup />);

    await userEvent.click(screen.getByRole("radio", { name: /truck/i }));
    await userEvent.keyboard("{ArrowLeft}");

    expect(screen.getByRole("radio", { name: /van/i })).toBeChecked();
  });

  it("renders the optional icon", () => {
    render(<ControlledChoiceCardGroup />);

    expect(screen.getByTestId("bus-icon")).toBeInTheDocument();
  });

  it("works as a controlled field of a react-hook-form Controller", async () => {
    const handleSubmit = jest.fn();
    render(<VehicleForm onSubmit={handleSubmit} />);

    await userEvent.click(screen.getByRole("radio", { name: /bus/i }));
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(handleSubmit).toHaveBeenCalledWith({ vehicle: "BUS" });
  });
});
