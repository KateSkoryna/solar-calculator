"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type ResetPasswordFormData = z.infer<
  ReturnType<typeof buildResetPasswordSchema>
>;

function buildResetPasswordSchema(
  passwordMinLength: string,
  passwordsDontMatch: string,
) {
  return z
    .object({
      password: z.string().min(8, passwordMinLength),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: passwordsDontMatch,
      path: ["confirmPassword"],
    });
}

export default function ResetPasswordForm() {
  const t = useTranslations("resetPassword");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPasswordSchema = useMemo(
    () =>
      buildResetPasswordSchema(
        tAuth("passwordMinLength"),
        tAuth("passwordsDontMatch"),
      ),
    [tAuth],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError(t("invalidResetLink"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || t("resetFailed"));
        setIsLoading(false);
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setError(tAuth("genericError"));
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md">
        <h3 className="!text-[var(--accent)] text-center mb-4">
          {t("invalidResetLinkTitle")}
        </h3>
        <p className="text-sm text-[var(--text-body)] text-center mb-6">
          {t("invalidResetLinkMessage")}
        </p>
        <Link
          href="/forgot-password"
          className="block w-full bg-[var(--accent)] text-white text-center p-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          {t("requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md">
      <h3 className="!text-[var(--accent)] text-center mb-2">{t("title")}</h3>
      <p className="text-sm text-[var(--text-body)] text-center mb-6">
        {t("subtitle")}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
            {t("newPassword")}
          </label>
          <input
            {...register("password")}
            type="password"
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
            placeholder={tAuth("passwordHint")}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
            {t("confirmNewPassword")}
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
            placeholder={tAuth("confirmPasswordPlaceholder")}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[var(--accent)] text-white p-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t("resetting") : t("submitButton")}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          {tAuth("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
