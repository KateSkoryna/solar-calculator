import { useTranslations } from "next-intl";

export interface AnswerRow {
  label: string;
  value: string | null;
}

interface AnswersListProps {
  answers: AnswerRow[];
}

export default function AnswersList({ answers }: AnswersListProps) {
  const t = useTranslations("calculator.answers");

  return (
    <dl className="flex flex-col divide-y divide-line">
      {answers.map(({ label, value }) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
        >
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="text-right text-[15px] font-semibold text-ink">
            {value ?? t("unanswered")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
