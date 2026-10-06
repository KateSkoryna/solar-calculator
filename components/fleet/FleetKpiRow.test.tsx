import { screen } from "@testing-library/react";
import FleetKpiRow from "./FleetKpiRow";
import type { FleetKpis } from "@/lib/fleet-dashboard";
import { renderWithIntl } from "@/test-support/render-with-intl";

function kpis(overrides: Partial<FleetKpis> = {}): FleetKpis {
  return {
    couldSaveEurosPerYear: 12000,
    averagePaybackMonths: 52,
    co2AvoidedKgPerYear: 4500,
    calculatedGroupCount: 3,
    groupsWithoutPaybackCount: 0,
    notCalculatedYetCount: 0,
    ...overrides,
  };
}

describe("FleetKpiRow", () => {
  it("says how many calculated groups the averages are based on", () => {
    renderWithIntl(
      <FleetKpiRow kpis={kpis()} vehicleCount={1} groupCount={1} />,
    );

    expect(
      screen.getByText("based on 3 calculated groups"),
    ).toBeInTheDocument();
    expect(screen.getByText("4 years 4 months")).toBeInTheDocument();
  });

  it("puts the years above the months in the average payback", () => {
    renderWithIntl(
      <FleetKpiRow kpis={kpis()} vehicleCount={1} groupCount={1} />,
    );

    expect(screen.getByText("4 years 4 months").textContent).toBe(
      "4\u00a0years\n4\u00a0months",
    );
  });

  it("uses the singular for one calculated group", () => {
    renderWithIntl(
      <FleetKpiRow
        kpis={kpis({ calculatedGroupCount: 1 })}
        vehicleCount={1}
        groupCount={1}
      />,
    );

    expect(screen.getByText("based on 1 calculated group")).toBeInTheDocument();
  });

  it("mentions groups that are left out because they never pay off", () => {
    renderWithIntl(
      <FleetKpiRow
        kpis={kpis({ groupsWithoutPaybackCount: 2 })}
        vehicleCount={1}
        groupCount={1}
      />,
    );

    expect(
      screen.getByText(/2 groups never pay off and are left out/),
    ).toBeInTheDocument();
  });

  it("shows how many vehicles the fleet has and in how many groups", () => {
    renderWithIntl(
      <FleetKpiRow kpis={kpis()} vehicleCount={14} groupCount={3} />,
    );

    expect(screen.getByText("Vehicles")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("in 3 groups")).toBeInTheDocument();
  });

  it("shows dashes instead of zeros when nothing is calculated", () => {
    renderWithIntl(
      <FleetKpiRow
        kpis={kpis({
          couldSaveEurosPerYear: 0,
          averagePaybackMonths: null,
          co2AvoidedKgPerYear: 0,
          calculatedGroupCount: 0,
          notCalculatedYetCount: 2,
        })}
        vehicleCount={1}
        groupCount={1}
      />,
    );

    expect(screen.getAllByText("—")).toHaveLength(3);
    expect(screen.getByText("no calculated groups yet")).toBeInTheDocument();
  });

  it("does not claim an average when no calculated group pays back", () => {
    renderWithIntl(
      <FleetKpiRow
        kpis={kpis({
          averagePaybackMonths: null,
          calculatedGroupCount: 2,
          groupsWithoutPaybackCount: 2,
        })}
        vehicleCount={1}
        groupCount={1}
      />,
    );

    expect(screen.queryByText(/based on/)).not.toBeInTheDocument();
    expect(
      screen.getByText(/2 groups never pay off and are left out/),
    ).toBeInTheDocument();
  });
});
