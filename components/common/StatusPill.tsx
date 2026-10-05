import { useTranslations } from "next-intl";
import type { ReportJobStatus } from "@/app/generated/prisma/enums";
import {
  REPORT_STATUS_DISPLAY,
  REPORT_STATUS_MESSAGE_NAMESPACE,
  type StatusPillVariant,
} from "@/lib/report-status-display";

const STATUS_PILL_VARIANT_CLASSES: Record<StatusPillVariant, string> = {
  success: "bg-lime-soft text-lime-soft-ink",
  progress: "bg-lime-soft text-lime-soft-ink",
  warning: "bg-warn-soft text-warn-ink",
  error: "bg-danger/10 text-danger",
};

const STATUS_PILL_DOT_CLASSES: Record<StatusPillVariant, string> = {
  success: "",
  progress: "animate-pulse",
  warning: "",
  error: "",
};

interface StatusPillProps {
  status: ReportJobStatus;
}

export default function StatusPill({ status }: StatusPillProps) {
  const t = useTranslations(REPORT_STATUS_MESSAGE_NAMESPACE);
  const { variant, messageKey } = REPORT_STATUS_DISPLAY[status];

  return (
    <span
      className={`inline-flex min-h-[30px] items-center gap-2 rounded-full px-3 text-[13px] font-semibold ${STATUS_PILL_VARIANT_CLASSES[variant]}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full bg-current ${STATUS_PILL_DOT_CLASSES[variant]}`}
      />
      {t(messageKey)}
    </span>
  );
}
