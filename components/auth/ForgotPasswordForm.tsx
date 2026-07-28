"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import Link from "next/link";

type ForgotPasswordFormData = z.infer<
  ReturnType<typeof buildForgotPasswordSchema>
>;

function buildForgotPasswordSchema(invalidEmail: string) {
  return z.object({
    email: z.string().email(invalidEmail),
  });
}

export default function ForgotPasswordForm() {
  const t = useTranslations("forgotPassword");
  const tAuth = useTranslations("auth");
  const tLogin = useTranslations("login");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const forgotPasswordSchema = useMemo(
    () => buildForgotPasswordSchema(tAuth("invalidEmail")),
    [tAuth],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        setError(tAuth("genericError"));
        setIsLoading(false);
        return;
      }

      setMessage(t("successMessage"));
      setIsLoading(false);
    } catch {
      setError(tAuth("genericError"));
      setIsLoading(false);
    }
  };

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

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
            {tLogin("email")}
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
            placeholder={tLogin("emailPlaceholder")}
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
          {isLoading ? t("sending") : t("sendResetLink")}
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
