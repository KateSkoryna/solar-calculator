import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChipGroup from "./ChipGroup";
import type { ChoiceOption } from "@/lib/choice-option";

type SampleParking = "DEPOT" | "STREET" | "MIXED";

const GROUP_LABEL = "Where do they park overnight?";

const PARKING_OPTIONS: ChoiceOption<SampleParking>[] = [
  { value: "DEPOT", label: "At our depot" },
  { value: "STREET", label: "On the street" },
  { value: "MIXED", label: "It varies", disabled: true },
];

function ControlledChipGroup() {
  const [selectedParking, setSelectedParking] =
    useState<SampleParking>("DEPOT");

  return (
    <ChipGroup
      name="parking"
      label={GROUP_LABEL}
      options={PARKING_OPTIONS}
      value={selectedParking}
      onChange={setSelectedParking}
    />
  );
}

describe("ChipGroup", () => {
  it("is a named radio group with the current value checked", () => {
    render(<ControlledChipGroup />);

    expect(
      screen.getByRole("radiogroup", { name: GROUP_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "At our depot" })).toBeChecked();
  });

  it("selects a chip when it is clicked", async () => {
    render(<ControlledChipGroup />);

    await userEvent.click(screen.getByRole("radio", { name: "On the street" }));

    expect(screen.getByRole("radio", { name: "On the street" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "At our depot" }),
    ).not.toBeChecked();
  });

  it("moves the selection with the arrow keys", async () => {
    render(<ControlledChipGroup />);

    screen.getByRole("radio", { name: "At our depot" }).focus();
    await userEvent.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: "On the street" })).toBeChecked();
  });

  it("disables a disabled option", () => {
    render(<ControlledChipGroup />);

    expect(screen.getByRole("radio", { name: "It varies" })).toBeDisabled();
  });
});
