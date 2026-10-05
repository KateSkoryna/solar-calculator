"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import GoogleMark from "@/components/auth/GoogleMark";
import Button from "@/components/form/Button";
import { workspacePath } from "@/lib/workspace-path";

interface GoogleSignInButtonProps {
  label: string;
}

export default function GoogleSignInButton({ label }: GoogleSignInButtonProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const continueWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: workspacePath(locale) });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      fullWidth
      icon={<GoogleMark />}
      loading={isLoading}
      onClick={continueWithGoogle}
    >
      {isLoading ? t("signingIn") : label}
    </Button>
  );
}
