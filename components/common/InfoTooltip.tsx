import { useTranslations } from "next-intl";
import { FiInfo } from "react-icons/fi";

interface InfoTooltipProps {
  text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  const t = useTranslations("common");

  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label={t("moreInfo")}
        className="ml-1 inline-flex cursor-pointer text-ink hover:text-lime-soft-ink focus:text-lime-soft-ink focus:outline-none"
      >
        <FiInfo aria-hidden="true" size={14} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-md border border-line-strong bg-surface p-2 text-left text-xs font-normal text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
