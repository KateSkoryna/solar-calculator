import { useLocale, useTranslations } from "next-intl";
import ButtonLink from "@/components/form/ButtonLink";
import ResultsNotice from "@/components/results/ResultsNotice";
import { calculatorPath } from "@/lib/public-paths";

export default function ResultsError() {
  const t = useTranslations("results.error");
  const locale = useLocale();

  return (
    <ResultsNotice title={t("title")} text={t("text")}>
      <ButtonLink href={calculatorPath(locale)}>{t("action")}</ButtonLink>
    </ResultsNotice>
  );
}
