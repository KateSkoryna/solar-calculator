import type { SVGProps } from "react";

export default function TrailerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="5" width="17" height="10" rx="1" />
      <path d="M19 15h3" />
      <path d="M4 15v3" />
      <path d="M9 17.5h1" />
      <circle cx="12.5" cy="17.5" r="2.5" />
      <circle cx="17" cy="17.5" r="2.5" />
    </svg>
  );
}
