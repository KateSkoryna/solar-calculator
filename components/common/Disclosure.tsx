import type { ReactNode } from "react";
import DropdownChevron from "@/components/common/DropdownChevron";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";

interface DisclosureProps {
  summary: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function Disclosure({
  summary,
  defaultOpen = false,
  children,
}: DisclosureProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-line bg-surface text-ink"
    >
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-4 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden ${FOCUS_RING_CLASSES}`}
      >
        {summary}
        <DropdownChevron />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
