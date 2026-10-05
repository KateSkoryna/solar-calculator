import {
  SUN_HIGHLIGHT_CENTER_PERCENT,
  SUN_HIGHLIGHT_SIZE_PERCENT,
} from "@/lib/sun-highlight";

interface BrandIllustrationProps {
  highlighted?: boolean;
  className?: string;
}

export default function BrandIllustration({
  highlighted = false,
  className = "",
}: BrandIllustrationProps) {
  return (
    <span
      aria-hidden="true"
      data-brand-illustration=""
      className={`relative block aspect-square rounded-full bg-sun ${className}`}
    >
      {highlighted && (
        <span
          data-sun-highlight=""
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35"
          style={{
            left: `${SUN_HIGHLIGHT_CENTER_PERCENT}%`,
            top: `${SUN_HIGHLIGHT_CENTER_PERCENT}%`,
            width: `${SUN_HIGHLIGHT_SIZE_PERCENT}%`,
            height: `${SUN_HIGHLIGHT_SIZE_PERCENT}%`,
          }}
        />
      )}
    </span>
  );
}
