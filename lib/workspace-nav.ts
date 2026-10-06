import type { IconType } from "react-icons";
import {
  LuCalculator,
  LuLayoutDashboard,
  LuTruck,
  LuUsers,
} from "react-icons/lu";

export const WORKSPACE_NAV_MESSAGE_NAMESPACE = "workspace.nav";

export interface WorkspaceNavItem {
  messageKey: string;
  routeSuffix: string;
  icon: IconType;
}

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  { messageKey: "overview", routeSuffix: "/overview", icon: LuLayoutDashboard },
  { messageKey: "vehicles", routeSuffix: "/vehicles", icon: LuTruck },
  {
    messageKey: "calculations",
    routeSuffix: "/calculations",
    icon: LuCalculator,
  },
  { messageKey: "audit", routeSuffix: "/audit", icon: LuUsers },
];

export function workspaceNavHref(
  locale: string,
  fleetSlug: string,
  { routeSuffix }: WorkspaceNavItem,
) {
  return `/${locale}/${fleetSlug}${routeSuffix}`;
}

export function isWorkspaceNavItemCurrent(pathname: string, href: string) {
  const normalizedPathname = pathname.replace(/\/+$/, "");
  return (
    normalizedPathname === href || normalizedPathname.startsWith(`${href}/`)
  );
}

export function workspaceNavItemPath(
  locale: string,
  fleetSlug: string,
  messageKey: WorkspaceNavItem["messageKey"],
) {
  const item = WORKSPACE_NAV_ITEMS.find(
    (navItem) => navItem.messageKey === messageKey,
  );
  if (!item) throw new Error(`Unknown workspace nav item: ${messageKey}`);
  return workspaceNavHref(locale, fleetSlug, item);
}
