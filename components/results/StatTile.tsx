import InfoTooltip from "@/components/common/InfoTooltip";
import Text from "@/components/common/Text";

interface StatTileProps {
  label: string;
  value: string;
  explanation: string;
  tooltip?: string;
  emphasis?: boolean;
}

export default function StatTile({
  label,
  value,
  explanation,
  tooltip,
  emphasis = false,
}: StatTileProps) {
  const quietTone = emphasis ? "on-dark-muted" : "muted";

  return (
    <div className="animate-rise">
      <div
        className={`flex h-full items-center justify-between gap-4 rounded-xl border p-6 text-left transition duration-200 hover:-translate-y-[3px] hover:shadow-hover md:flex-col md:items-start md:justify-start md:gap-2.5 lg:p-7 ${
          emphasis ? "border-transparent bg-hero" : "border-line bg-surface"
        }`}
      >
        <div className="flex min-w-0 flex-col gap-1 md:contents">
          <Text tone={quietTone} className="flex items-center font-semibold">
            {label}
            {tooltip && <InfoTooltip text={tooltip} />}
          </Text>
          <Text size="small" tone={quietTone} className="md:order-last">
            {explanation}
          </Text>
        </div>
        <p
          className={`font-display text-[28px] leading-none font-extrabold tracking-[-0.02em] whitespace-nowrap tabular-nums md:text-4xl lg:text-[44px] ${
            emphasis ? "text-lime" : "text-ink"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
