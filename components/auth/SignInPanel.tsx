"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import EmailSignInForm from "@/components/auth/EmailSignInForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Heading from "@/components/common/Heading";
import SegmentedControl from "@/components/common/SegmentedControl";
import { loginPath, registerPath } from "@/lib/public-paths";

export type SignInMode = "login" | "register";

const AUTH_ERROR_MESSAGE_KEYS: Record<string, string> = {
  OAuthAccountNotLinked: "oauthAccountNotLinked",
  Verification: "linkExpiredOrUsed",
  EmailSignin: "emailSignInFailed",
};
const DEFAULT_AUTH_ERROR_MESSAGE_KEY = "genericError";

interface SignInPanelProps {
  mode: SignInMode;
}

export default function SignInPanel({ mode }: SignInPanelProps) {
  const t = useTranslations("signIn");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const errorCode = useSearchParams().get("error");
  const linkProblem = errorCode
    ? tAuth(
        AUTH_ERROR_MESSAGE_KEYS[errorCode] ?? DEFAULT_AUTH_ERROR_MESSAGE_KEY,
      )
    : null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SegmentedControl
        label={t("tabs.label")}
        links={[
          {
            label: t("tabs.login"),
            href: loginPath(locale),
            isCurrent: mode === "login",
          },
          {
            label: t("tabs.register"),
            href: registerPath(locale),
            isCurrent: mode === "register",
          },
        ]}
      />
      <Heading level={1} size="display-s" className="text-left">
        {t(`${mode}.title`)}
      </Heading>
      <GoogleSignInButton label={t(`${mode}.google`)} />
      <div className="flex items-center gap-3 text-sm text-muted">
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        {t("divider")}
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
      <EmailSignInForm linkProblem={linkProblem} />
    </div>
  );
}
