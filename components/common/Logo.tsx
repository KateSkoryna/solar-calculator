import { useTranslations } from "next-intl";

interface LogoProps {
  onDark?: boolean;
  className?: string;
}

export default function Logo({ onDark = false, className = "" }: LogoProps) {
  const t = useTranslations("header");
  const markClasses = onDark ? "bg-ground/20" : "bg-forest";
  const nameClasses = onDark ? "text-white" : "text-ink";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${markClasses}`}
      >
        <span className="size-3.5 rounded-full bg-sun" />
      </span>
      <span className={`font-display text-lg font-bold ${nameClasses}`}>
        {t("title")}
      </span>
    </span>
  );
}
