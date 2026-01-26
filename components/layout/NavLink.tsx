"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
}

export default function NavLink({
  href,
  children,
  className = "",
  noHover = false,
}: NavLinkProps) {
  const pathname = usePathname();

  const isActive = () => {
    if (href === "/") {
      return pathname === "/" || pathname.match(/^\/[a-z]{2}$/);
    }
    return pathname === href || pathname.endsWith(href);
  };

  const hoverClasses = noHover ? "" : "hover:text-[var(--accent)] focus:text-[var(--accent)]";

  return (
    <Link
      href={href}
      className={`${hoverClasses} focus:outline-none transition-colors ${
        isActive() ? "text-[var(--accent)]" : "text-[var(--text-body)]"
      } ${className}`}
    >
      {children}
    </Link>
  );
}
