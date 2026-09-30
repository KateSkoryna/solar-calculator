"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import EmailSignInForm from "@/components/auth/EmailSignInForm";

const AUTH_ERROR_MESSAGE_KEYS = new Map([
  ["OAuthAccountNotLinked", "oauthAccountNotLinked"],
  ["Verification", "linkExpiredOrUsed"],
  ["EmailSignin", "emailSignInFailed"],
]);

export default function Form() {
  const t = useTranslations("login");
  const tAuth = useTranslations("auth");
  const errorCode = useSearchParams().get("error");

  const errorMessage = errorCode
    ? tAuth(AUTH_ERROR_MESSAGE_KEYS.get(errorCode) ?? "genericError")
    : null;

  return (
    <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md">
      <h3 className="!text-[var(--accent)] text-center mb-6">{t("title")}</h3>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <GoogleSignInButton />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[var(--form-bg)] text-[var(--text-body)]">
            {t("orContinueWithEmail")}
          </span>
        </div>
      </div>

      <EmailSignInForm />

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--text-body)]">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="text-[var(--accent)] hover:underline"
          >
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
