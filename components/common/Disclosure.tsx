import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
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
        className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-6 py-5 text-base font-semibold [&::-webkit-details-marker]:hidden ${FOCUS_RING_CLASSES}`}
      >
        {summary}
        <LuChevronDown
          aria-hidden="true"
          className="size-5 shrink-0 transition-transform duration-150 group-open:rotate-180"
        />
      </summary>
      <div className="px-6 pb-5">{children}</div>
    </details>
  );
}
