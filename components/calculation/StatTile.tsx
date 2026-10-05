import InfoTooltip from "@/components/common/InfoTooltip";

interface StatTileProps {
  label: string;
  value: string;
  tooltip: string;
}

export default function StatTile({ label, value, tooltip }: StatTileProps) {
  return (
    <div className="rounded-lg border border-line-strong bg-surface p-6 text-center sm:p-8">
      <p className="flex items-center justify-center text-sm text-ink">
        {label}
        <InfoTooltip text={tooltip} />
      </p>
      <p className="mt-2 text-3xl font-bold text-lime-soft-ink sm:text-4xl">
        {value}
      </p>
    </div>
  );
}
