"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import EmailSignInForm from "@/components/auth/EmailSignInForm";

export default function RegisterForm() {
  const t = useTranslations("register");

  return (
    <div className="bg-surface p-8 rounded-lg shadow-md">
      <h3 className="!text-lime-soft-ink text-center mb-6">{t("title")}</h3>

      <GoogleSignInButton />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line-strong"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-ink">
            {t("orContinueWithEmail")}
          </span>
        </div>
      </div>

      <EmailSignInForm />

      <div className="mt-6 text-center">
        <p className="text-sm text-ink">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-lime-soft-ink hover:underline">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
