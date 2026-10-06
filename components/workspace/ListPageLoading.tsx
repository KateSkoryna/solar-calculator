import { useTranslations } from "next-intl";

interface ListPageLoadingProps {
  messageKey: string;
}

export default function ListPageLoading({ messageKey }: ListPageLoadingProps) {
  const t = useTranslations();

  return (
    <div
      role="status"
      aria-busy="true"
      className="flex animate-pulse flex-col gap-6"
    >
      <span className="sr-only">{t(messageKey)}</span>
      <div className="h-12 w-72 rounded-md bg-soft" />
      <div className="h-64 rounded-xl bg-soft" />
    </div>
  );
}
