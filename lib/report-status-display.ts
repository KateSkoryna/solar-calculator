import { ReportJobStatus } from "@/app/generated/prisma/enums";

export const STATUS_PILL_VARIANTS = [
  "success",
  "progress",
  "warning",
  "error",
] as const;

export type StatusPillVariant = (typeof STATUS_PILL_VARIANTS)[number];

export interface ReportStatusDisplay {
  variant: StatusPillVariant;
  messageKey: string;
}

export const REPORT_STATUS_MESSAGE_NAMESPACE = "status";

export const REPORT_STATUS_DISPLAY: Record<
  ReportJobStatus,
  ReportStatusDisplay
> = {
  [ReportJobStatus.QUEUED]: { variant: "progress", messageKey: "queued" },
  [ReportJobStatus.VALIDATING]: {
    variant: "progress",
    messageKey: "validating",
  },
  [ReportJobStatus.CALCULATING]: {
    variant: "progress",
    messageKey: "calculating",
  },
  [ReportJobStatus.RENDERING_CHARTS]: {
    variant: "progress",
    messageKey: "renderingCharts",
  },
  [ReportJobStatus.GENERATING_REPORT]: {
    variant: "progress",
    messageKey: "generatingReport",
  },
  [ReportJobStatus.GENERATING_RECOMMENDATIONS]: {
    variant: "progress",
    messageKey: "generatingRecommendations",
  },
  [ReportJobStatus.COMPLETED]: { variant: "success", messageKey: "completed" },
  [ReportJobStatus.FAILED]: { variant: "error", messageKey: "failed" },
  [ReportJobStatus.CANCELLED]: { variant: "warning", messageKey: "cancelled" },
};
