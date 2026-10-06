import { LuChevronDown } from "react-icons/lu";

interface DropdownChevronProps {
  rotatesWhenOpen?: boolean;
  className?: string;
}

export default function DropdownChevron({
  rotatesWhenOpen = true,
  className = "",
}: DropdownChevronProps) {
  const rotationClasses = rotatesWhenOpen
    ? "transition-transform duration-150 group-open:rotate-180"
    : "";

  return (
    <LuChevronDown
      aria-hidden="true"
      className={`size-5 shrink-0 ${rotationClasses} ${className}`}
    />
  );
}
