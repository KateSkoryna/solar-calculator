import { screen, within } from "@testing-library/react";
import HowWeCalculated from "./HowWeCalculated";
import { toResultsViewModel } from "@/lib/results-view-model";
import { toProvenanceDetails } from "@/lib/stored-calculation";
import {
  calculateOutput,
  toStoredCalculation,
} from "@/test-support/results-fixtures";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const howWeCalculatedMessages = englishMessages.results.howWeCalculated;
const sourceLabels: string[] = Object.values(howWeCalculatedMessages.sources);

describe("HowWeCalculated", () => {
  const output = calculateOutput({ city: "Berlin" });
  const viewModel = toResultsViewModel(output);

  beforeEach(() => {
    renderWithIntl(
      <HowWeCalculated
        inputs={viewModel.inputs}
        formulaVersion={viewModel.formulaVersion}
        assumptionSetVersion={viewModel.assumptionSetVersion}
      />,
    );
  });

  it("lists every input with a source label", () => {
    const inputKeys = Object.keys(
      output.inputSources,
    ) as (keyof typeof howWeCalculatedMessages.inputs)[];

    expect(inputKeys.length).toBeGreaterThan(0);
    for (const inputKey of inputKeys) {
      const row = screen.getByText(howWeCalculatedMessages.inputs[inputKey])
        .parentElement as HTMLElement;
      const rowSourceLabels = sourceLabels.filter((sourceLabel) =>
        within(row).queryByText(sourceLabel),
      );
      expect(rowSourceLabels).toHaveLength(1);
    }
  });

  it("marks values the visitor did not give as typical", () => {
    const panelPowerRow = screen.getByText(
      howWeCalculatedMessages.inputs.solarPanelCapacityKw,
    ).parentElement as HTMLElement;

    expect(
      within(panelPowerRow).getByText(howWeCalculatedMessages.sources.PRESET),
    ).toBeInTheDocument();
  });

  it("translates option values and the country", () => {
    expect(screen.getByText("Van")).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
  });

  it("shows the method and assumption versions", () => {
    expect(screen.getByText(output.formulaVersion)).toBeInTheDocument();
    expect(screen.getByText(output.assumptionSetVersion)).toBeInTheDocument();
  });
});

describe("HowWeCalculated provenance", () => {
  const output = calculateOutput();
  const viewModel = toResultsViewModel(output);

  function renderWithProvenance(withProvenance: boolean) {
    renderWithIntl(
      <HowWeCalculated
        inputs={viewModel.inputs}
        formulaVersion={viewModel.formulaVersion}
        assumptionSetVersion={viewModel.assumptionSetVersion}
        provenance={
          withProvenance
            ? toProvenanceDetails(toStoredCalculation(output))
            : undefined
        }
      />,
    );
  }

  it("lists who calculated and when, for saved results", () => {
    renderWithProvenance(true);

    const provenanceLabels = howWeCalculatedMessages.provenance;
    for (const label of Object.values(provenanceLabels)) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("Mira Hoffmann")).toBeInTheDocument();
    expect(screen.getAllByText(/Sep 29, 2026/)).toHaveLength(2);
  });

  it("leaves the provenance out of a public result", () => {
    renderWithProvenance(false);

    expect(
      screen.queryByText(howWeCalculatedMessages.provenance.requestedBy),
    ).not.toBeInTheDocument();
  });
});
