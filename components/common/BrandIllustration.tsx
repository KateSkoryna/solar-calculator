const SUN_DISC_CLASSES =
  "absolute -inset-[5%] rounded-full bg-[radial-gradient(circle_closest-side,var(--sun)_0%,var(--sun)_76%,transparent_100%)]";
const SUN_GLOW_CLASSES =
  "absolute -inset-[22%] rounded-full bg-sun/30 blur-3xl";
const SUN_HALO_RING_CLASSES = [
  "absolute -inset-[10%] rounded-full border border-black/30",
  "absolute -inset-[24%] rounded-full border border-black/20",
];
const LENS_FLARE_CLASSES = [
  "left-[0%] top-[90%] w-[10%] bg-sun-core/25",
  "left-[-14%] top-[107%] w-[7%] bg-sun-core/20",
  "left-[-39%] top-[119%] w-[20%] border border-sun-core/30 bg-sun-core/5",
  "left-[-55%] top-[146%] w-[9%] bg-sun-core/15",
];

interface BrandIllustrationProps {
  radiant?: boolean;
  className?: string;
}

export default function BrandIllustration({
  radiant = false,
  className = "",
}: BrandIllustrationProps) {
  if (!radiant) {
    return (
      <span
        aria-hidden="true"
        data-brand-illustration=""
        className={`block aspect-square rounded-full bg-sun ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      data-brand-illustration=""
      className={`relative block aspect-square ${className}`}
    >
      <span className={SUN_GLOW_CLASSES} />
      {SUN_HALO_RING_CLASSES.map((ringClasses) => (
        <span key={ringClasses} data-sun-orbit="" className={ringClasses} />
      ))}
      <span className={SUN_DISC_CLASSES} />
      {LENS_FLARE_CLASSES.map((flareClasses) => (
        <span
          key={flareClasses}
          data-lens-flare=""
          className={`absolute aspect-square rounded-full ${flareClasses}`}
        />
      ))}
    </span>
  );
}
