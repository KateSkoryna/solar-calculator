import type { SVGProps } from "react";

export default function VanIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M2 17V7a1 1 0 0 1 1-1h11.5a2 2 0 0 1 1.6.8l3.5 4.7a2 2 0 0 0 .9.7l.9.3a1 1 0 0 1 .6.9V17h-2" />
      <path d="M9.5 17h5" />
      <path d="M2 17h2.5" />
      <path d="M13 6v5.5h7" />
      <circle cx="7" cy="17" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </svg>
  );
}
