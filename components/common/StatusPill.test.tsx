import { screen } from "@testing-library/react";
import StatusPill from "./StatusPill";
import { ReportJobStatus } from "@/app/generated/prisma/enums";
import { REPORT_STATUS_DISPLAY } from "@/lib/report-status-display";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const statusLabels: Record<string, string> = englishMessages.status;

describe("StatusPill", () => {
  it.each(Object.values(ReportJobStatus))(
    "renders a text label for %s",
    (status) => {
      renderWithIntl(<StatusPill status={status} />);

      const label = statusLabels[REPORT_STATUS_DISPLAY[status].messageKey];
      expect(label).toBeTruthy();
      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );
});
