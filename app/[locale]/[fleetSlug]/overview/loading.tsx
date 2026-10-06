import { useTranslations } from "next-intl";

const KPI_PLACEHOLDER_COUNT = 4;

export default function FleetOverviewLoading() {
  const t = useTranslations("overview");

  return (
    <div
      role="status"
      aria-busy="true"
      className="flex flex-col gap-6 animate-pulse"
    >
      <span className="sr-only">{t("loading")}</span>
      <div className="h-12 w-72 rounded-md bg-soft" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: KPI_PLACEHOLDER_COUNT }, (_, index) => (
          <div key={index} className="h-36 rounded-xl bg-soft" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-soft" />
    </div>
  );
}
