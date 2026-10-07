import {
  calculatorPath,
  howItWorksPath,
  productPath,
  whyItPaysPath,
} from "@/lib/public-paths";
import { workspacePath } from "@/lib/workspace-path";

export const PUBLIC_NAV_MESSAGE_NAMESPACE = "header";

export interface PublicNavItem {
  messageKey: string;
  href: string;
}

export function buildPublicNavItems(
  locale: string,
  isSignedIn: boolean,
): PublicNavItem[] {
  const alwaysVisibleItems: PublicNavItem[] = [
    { messageKey: "whyItPays", href: whyItPaysPath(locale) },
    { messageKey: "product", href: productPath(locale) },
    { messageKey: "howItWorks", href: howItWorksPath(locale) },
    { messageKey: "calculator", href: calculatorPath(locale) },
  ];
  const signedInItems: PublicNavItem[] = [
    { messageKey: "myFleet", href: workspacePath(locale) },
  ];

  return isSignedIn
    ? [...alwaysVisibleItems, ...signedInItems]
    : alwaysVisibleItems;
}
