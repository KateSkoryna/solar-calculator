import PublicResults from "@/components/results/PublicResults";
import { RESULTS_ANSWERS_PARAMETER } from "@/lib/public-paths";

interface ResultsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { [RESULTS_ANSWERS_PARAMETER]: encodedAnswers } = await searchParams;

  return (
    <PublicResults
      encodedAnswers={
        typeof encodedAnswers === "string" ? encodedAnswers : undefined
      }
    />
  );
}
