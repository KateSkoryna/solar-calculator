import { signOut } from "next-auth/react";
import { homePath } from "@/lib/public-paths";

export function signOutToHome(locale: string) {
  return signOut({ callbackUrl: homePath(locale) });
}
