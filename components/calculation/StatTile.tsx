import InfoTooltip from "@/components/common/InfoTooltip";

interface StatTileProps {
  label: string;
  value: string;
  tooltip: string;
}

export default function StatTile({ label, value, tooltip }: StatTileProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center sm:p-8">
      <p className="flex items-center justify-center text-sm text-[var(--text-body)]">
        {label}
        <InfoTooltip text={tooltip} />
      </p>
      <p className="mt-2 text-3xl font-bold text-[var(--accent)] sm:text-4xl">
        {value}
      </p>
    </div>
  );
}
