"use client";

import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type EmailSignInFormData = z.infer<ReturnType<typeof buildEmailSignInSchema>>;

function buildEmailSignInSchema(invalidEmail: string) {
  return z.object({
    email: z.string().email(invalidEmail),
  });
}

export default function EmailSignInForm() {
  const t = useTranslations("emailSignIn");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailSignInSchema = useMemo(
    () => buildEmailSignInSchema(tAuth("invalidEmail")),
    [tAuth],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailSignInFormData>({
    resolver: zodResolver(emailSignInSchema),
  });

  const onSubmit = async ({ email }: EmailSignInFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("nodemailer", {
        email,
        callbackUrl: `/${locale}/user`,
        redirect: false,
      });

      if (result?.error) {
        setError(tAuth("emailSignInFailed"));
        setIsLoading(false);
        return;
      }

      router.push(`/${locale}/check-email`);
    } catch {
      setError(tAuth("genericError"));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
          {t("email")}
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
          placeholder={t("emailPlaceholder")}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[var(--accent)] text-white p-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? tAuth("loading") : t("submitButton")}
      </button>
    </form>
  );
}
