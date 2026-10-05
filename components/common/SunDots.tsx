export const MAXIMUM_SUN_RATING = 3;

interface SunDotsProps {
  rating: number;
}

export default function SunDots({ rating }: SunDotsProps) {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center gap-1">
      {Array.from({ length: MAXIMUM_SUN_RATING }, (_, dotIndex) => (
        <span
          key={dotIndex}
          data-filled={dotIndex < rating}
          className="size-2.5 rounded-full bg-track data-[filled=true]:bg-sun"
        />
      ))}
    </span>
  );
}
