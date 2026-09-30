"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import EmailSignInForm from "@/components/auth/EmailSignInForm";

export default function RegisterForm() {
  const t = useTranslations("register");

  return (
    <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md">
      <h3 className="!text-[var(--accent)] text-center mb-6">{t("title")}</h3>

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
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
