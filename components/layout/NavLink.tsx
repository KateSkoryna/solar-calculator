"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function NavLink({
  href,
  children,
  className = "",
}: NavLinkProps) {
  const pathname = usePathname();

  const isActive = () => {
    if (href === "/") {
      return pathname === "/" || pathname.match(/^\/[a-z]{2}$/);
    }
    return pathname === href || pathname.endsWith(href);
  };

  return (
    <Link
      href={href}
      className={`hover:text-[var(--accent)] focus:text-[var(--accent)] focus:outline-none transition-colors ${
        isActive() ? "text-[var(--accent)]" : "text-[var(--text-body)]"
      } ${className}`}
    >
      {children}
    </Link>
  );
}
