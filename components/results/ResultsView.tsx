import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import HowWeCalculated from "@/components/results/HowWeCalculated";
import PaybackChart from "@/components/results/PaybackChart";
import ResultsContextLine from "@/components/results/ResultsContextLine";
import SavingsBreakdown from "@/components/results/SavingsBreakdown";
import StatTile from "@/components/results/StatTile";
import { useResultsFormatters } from "@/components/results/useResultsFormatters";
import VerdictHeadline from "@/components/results/VerdictHeadline";
import PageContainer from "@/components/layout/PageContainer";
import type { ResultsViewModel } from "@/lib/results-view-model";
import type { ProvenanceDetails } from "@/lib/stored-calculation";

interface ResultsViewProps {
  viewModel: ResultsViewModel;
  actions?: ReactNode;
  saveCard?: ReactNode;
  provenance?: ProvenanceDetails;
  embedded?: boolean;
}

const RESULTS_LAYOUT_CLASSES = "flex flex-col gap-8 text-left lg:gap-10";

function ResultsLayout({
  embedded,
  children,
}: {
  embedded: boolean;
  children: ReactNode;
}) {
  if (embedded) {
    return <div className={RESULTS_LAYOUT_CLASSES}>{children}</div>;
  }

  return (
    <PageContainer className={`${RESULTS_LAYOUT_CLASSES} py-6 md:py-10`}>
      {children}
    </PageContainer>
  );
}

export default function ResultsView({
  viewModel,
  actions,
  saveCard,
  provenance,
  embedded = false,
}: ResultsViewProps) {
  const t = useTranslations("results.tiles");
  const { money, tonnes, rangeOf } = useResultsFormatters();
  const { tiles } = viewModel;

  return (
    <ResultsLayout embedded={embedded}>
      {actions}
      <div className="flex flex-col gap-4">
        <ResultsContextLine summary={viewModel.summary} />
        <VerdictHeadline verdict={viewModel.verdict} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
        <StatTile
          label={t("annualSavings")}
          value={money(tiles.annualSavingsEuros.realistic)}
          explanation={rangeOf(tiles.annualSavingsEuros, money)}
        />
        <StatTile
          label={t("oneTimeCost")}
          value={money(tiles.oneTimeCostEuros.realistic)}
          explanation={rangeOf(tiles.oneTimeCostEuros, money)}
        />
        <StatTile
          label={t("co2Avoided")}
          value={tonnes(tiles.co2AvoidedTonnes.realistic)}
          explanation={rangeOf(tiles.co2AvoidedTonnes, tonnes)}
        />
        <StatTile
          label={t("tenYearGain")}
          value={money(tiles.tenYearGainEuros.realistic)}
          explanation={rangeOf(tiles.tenYearGainEuros, money)}
          emphasis
        />
      </div>
      <PaybackChart chart={viewModel.chart} />
      <SavingsBreakdown lines={viewModel.savingsBreakdown} />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <HowWeCalculated
          inputs={viewModel.inputs}
          formulaVersion={viewModel.formulaVersion}
          assumptionSetVersion={viewModel.assumptionSetVersion}
          provenance={provenance}
        />
        {saveCard}
      </div>
    </ResultsLayout>
  );
}
