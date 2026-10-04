import { ReportJobStatus } from "@/app/generated/prisma/enums";
import englishMessages from "@/messages/en.json";
import {
  REPORT_STATUS_DISPLAY,
  STATUS_PILL_VARIANTS,
} from "./report-status-display";

const statusLabels: Record<string, string> = englishMessages.status;

describe("REPORT_STATUS_DISPLAY", () => {
  it("covers exactly the values of ReportJobStatus", () => {
    expect(Object.keys(REPORT_STATUS_DISPLAY).sort()).toEqual(
      Object.values(ReportJobStatus).sort(),
    );
  });

  it.each(Object.values(ReportJobStatus))(
    "maps %s to a known variant and an existing message",
    (status) => {
      const { variant, messageKey } = REPORT_STATUS_DISPLAY[status];

      expect(STATUS_PILL_VARIANTS).toContain(variant);
      expect(statusLabels[messageKey]).toBeTruthy();
    },
  );
});
