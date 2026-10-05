"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isAuthScreenPath } from "@/lib/auth-screens";

interface SiteChromeProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export default function SiteChrome({
  header,
  footer,
  children,
}: SiteChromeProps) {
  const hasChrome = !isAuthScreenPath(usePathname());

  return (
    <>
      {hasChrome && header}
      <main className="flex-1">{children}</main>
      {hasChrome && footer}
    </>
  );
}
