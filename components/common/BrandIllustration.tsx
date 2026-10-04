interface BrandIllustrationProps {
  className?: string;
}

export default function BrandIllustration({
  className = "",
}: BrandIllustrationProps) {
  return (
    <span
      aria-hidden="true"
      data-brand-illustration=""
      className={`block aspect-square rounded-full bg-sun ${className}`}
    />
  );
}
