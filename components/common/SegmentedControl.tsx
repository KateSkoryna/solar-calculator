import Link from "next/link";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";

export interface SegmentedLink {
  label: string;
  href: string;
  isCurrent: boolean;
}

interface SegmentedControlProps {
  label: string;
  links: SegmentedLink[];
}

export default function SegmentedControl({
  label,
  links,
}: SegmentedControlProps) {
  return (
    <nav
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-0 rounded-full bg-segment-track p-1"
    >
      {links.map(({ label: linkLabel, href, isCurrent }) => (
        <Link
          key={href}
          href={href}
          aria-current={isCurrent ? "page" : undefined}
          className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-[15px] font-semibold transition-colors duration-200 ${FOCUS_RING_CLASSES} ${
            isCurrent
              ? "bg-surface text-ink shadow-tab"
              : "text-muted hover:text-ink"
          }`}
        >
          {linkLabel}
        </Link>
      ))}
    </nav>
  );
}
