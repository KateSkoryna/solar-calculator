"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  isWorkspaceNavItemCurrent,
  WORKSPACE_NAV_ITEMS,
  WORKSPACE_NAV_MESSAGE_NAMESPACE,
  workspaceNavHref,
} from "@/lib/workspace-nav";

export function useWorkspaceNavLinks(fleetSlug: string) {
  const locale = useLocale();
  const pathname = usePathname() ?? "";
  const t = useTranslations(WORKSPACE_NAV_MESSAGE_NAMESPACE);

  return WORKSPACE_NAV_ITEMS.map((item) => {
    const href = workspaceNavHref(locale, fleetSlug, item);
    return {
      key: item.messageKey,
      label: t(item.messageKey),
      href,
      Icon: item.icon,
      isCurrent: isWorkspaceNavItemCurrent(pathname, href, item),
    };
  });
}
