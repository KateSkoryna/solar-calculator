import { useTranslations } from "next-intl";

interface GroupStatusPillProps {
  isCalculated: boolean;
}

export default function GroupStatusPill({
  isCalculated,
}: GroupStatusPillProps) {
  const t = useTranslations("overview.groups.status");
  const toneClasses = isCalculated
    ? "bg-lime-soft text-lime-soft-ink"
    : "bg-warn-soft text-warn-ink";

  return (
    <span
      className={`inline-flex min-h-[30px] items-center gap-2 rounded-full px-3 text-[13px] font-semibold ${toneClasses}`}
    >
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full bg-current"
      />
      {t(isCalculated ? "calculated" : "needsCalculation")}
    </span>
  );
}
