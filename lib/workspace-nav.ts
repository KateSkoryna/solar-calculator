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
  { messageKey: "overview", routeSuffix: "", icon: LuLayoutDashboard },
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

export function isWorkspaceNavItemCurrent(
  pathname: string,
  href: string,
  { routeSuffix }: WorkspaceNavItem,
) {
  const normalizedPathname = pathname.replace(/\/+$/, "");
  const isFleetRoot = routeSuffix === "";
  return isFleetRoot
    ? normalizedPathname === href
    : normalizedPathname === href || normalizedPathname.startsWith(`${href}/`);
}
