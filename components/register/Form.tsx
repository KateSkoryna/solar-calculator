"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

type RegisterFormData = z.infer<ReturnType<typeof buildRegisterSchema>>;

function buildRegisterSchema(
  nameMinLength: string,
  invalidEmail: string,
  passwordMinLength: string,
  passwordsDontMatch: string,
) {
  return z
    .object({
      name: z.string().min(2, nameMinLength).optional(),
      email: z.string().email(invalidEmail),
      password: z.string().min(8, passwordMinLength),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: passwordsDontMatch,
      path: ["confirmPassword"],
    });
}

export default function RegisterForm() {
  const t = useTranslations("register");
  const tAuth = useTranslations("auth");
  const tLogin = useTranslations("login");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const registerSchema = useMemo(
    () =>
      buildRegisterSchema(
        t("nameMinLength"),
        tAuth("invalidEmail"),
        tAuth("passwordMinLength"),
        tAuth("passwordsDontMatch"),
      ),
    [t, tAuth],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || t("registrationFailed"));
        setIsLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/user");
      router.refresh();
    } catch {
      setError(tAuth("genericError"));
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md">
      <h3 className="!text-[var(--accent)] text-center mb-6">{t("title")}</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
            {t("nameOptional")}
          </label>
          <input
            {...register("name")}
            type="text"
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
            placeholder={t("namePlaceholder")}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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

        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
            {tLogin("password")}
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
            {t("confirmPassword")}
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
          {isLoading ? t("creatingAccount") : t("signUpButton")}
        </button>
      </form>

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
