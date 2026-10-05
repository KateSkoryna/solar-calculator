import { signIn } from "next-auth/react";
import { workspacePath } from "@/lib/workspace-path";

export async function requestSignInLink(email: string, locale: string) {
  try {
    const result = await signIn("nodemailer", {
      email,
      callbackUrl: workspacePath(locale),
      redirect: false,
    });
    return result?.error ? "failed" : "sent";
  } catch {
    return "failed";
  }
}
