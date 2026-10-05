import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import ResultsNotice from "@/components/results/ResultsNotice";
import ResultsView from "@/components/results/ResultsView";
import { ForbiddenError } from "@/lib/fleet-auth";
import { loadFleetCalculation } from "@/lib/fleet-calculation-loader";
import { loginPath } from "@/lib/public-paths";
import {
  storedCalculationToEngineOutput,
  toResultsViewModel,
} from "@/lib/results-view-model";
import {
  IncompleteStoredCalculationError,
  toProvenanceDetails,
  type StoredCalculation,
} from "@/lib/stored-calculation";

interface CalculationResultPageProps {
  params: Promise<{
    locale: string;
    fleetSlug: string;
    calculationId: string;
  }>;
}

async function findCalculation(
  session: Session | null,
  fleetSlug: string,
  calculationId: string,
) {
  try {
    return await loadFleetCalculation(session, fleetSlug, calculationId);
  } catch (error) {
    if (error instanceof ForbiddenError) return null;
    throw error;
  }
}

function readResults(calculation: StoredCalculation) {
  try {
    return {
      viewModel: toResultsViewModel(
        storedCalculationToEngineOutput(calculation),
      ),
      provenance: toProvenanceDetails(calculation),
    };
  } catch (error) {
    if (error instanceof IncompleteStoredCalculationError) return null;
    throw error;
  }
}

export default async function CalculationResultPage({
  params,
}: CalculationResultPageProps) {
  const { locale, fleetSlug, calculationId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(loginPath(locale));
  }

  const t = await getTranslations("calculation");
  const calculation = await findCalculation(session, fleetSlug, calculationId);

  if (!calculation) {
    return <ResultsNotice title={t("notFoundTitle")} text={t("notFound")} />;
  }

  const results = readResults(calculation);

  if (!results) {
    return <ResultsNotice title={t("notFoundTitle")} text={t("noResultYet")} />;
  }

  return (
    <ResultsView
      viewModel={results.viewModel}
      provenance={results.provenance}
    />
  );
}
