import Text from "@/components/common/Text";

interface MiniStatProps {
  label: string;
  value: string;
  className?: string;
}

export default function MiniStat({
  label,
  value,
  className = "",
}: MiniStatProps) {
  return (
    <div className={`rounded-md bg-ground p-3 ${className}`}>
      <Text as="dt" size="caption" tone="muted">
        {label}
      </Text>
      <dd className="mt-1 font-display text-lg font-bold text-ink tabular-nums">
        {value}
      </dd>
    </div>
  );
}
