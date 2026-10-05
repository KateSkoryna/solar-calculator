"use client";

import { useMemo } from "react";
import ResultsActions from "@/components/results/ResultsActions";
import ResultsError from "@/components/results/ResultsError";
import ResultsView from "@/components/results/ResultsView";
import SaveToFleetCard from "@/components/results/SaveToFleetCard";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate } from "@/lib/calculation-engine";
import {
  decodeQuickCheck,
  quickCheckToCalculationInput,
} from "@/lib/quick-check-mapping";
import {
  toResultsViewModel,
  typicalValueInputKeys,
} from "@/lib/results-view-model";

function computePublicResults(encodedAnswers: string | undefined) {
  if (!encodedAnswers) return null;

  try {
    const answers = decodeQuickCheck(encodedAnswers);
    const output = calculate(
      quickCheckToCalculationInput(answers, ASSUMPTION_SET_V1),
      ASSUMPTION_SET_V1,
    );
    const distanceBand =
      answers.averageDailyDistanceKm === undefined
        ? answers.distanceBand
        : undefined;

    return { answers, viewModel: toResultsViewModel(output, { distanceBand }) };
  } catch {
    return null;
  }
}

interface PublicResultsProps {
  encodedAnswers?: string;
}

export default function PublicResults({ encodedAnswers }: PublicResultsProps) {
  const results = useMemo(
    () => computePublicResults(encodedAnswers),
    [encodedAnswers],
  );

  if (results === null) return <ResultsError />;

  return (
    <ResultsView
      viewModel={results.viewModel}
      actions={<ResultsActions />}
      saveCard={
        <SaveToFleetCard
          answers={results.answers}
          typicalValueInputs={typicalValueInputKeys(results.viewModel.inputs)}
        />
      }
    />
  );
}
