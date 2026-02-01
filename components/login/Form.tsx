"use client";
import { useTranslations } from "next-intl";

export default function Form() {
  const t = useTranslations("login");

  return (
    <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md">
      <h3 className="!text-[var(--accent)] text-center mb-6">{t("title")}</h3>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
            {t("email")}
          </label>
          <input
            type="email"
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
            placeholder={t("emailPlaceholder")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
            {t("password")}
          </label>
          <input
            type="password"
            className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
            placeholder={t("passwordPlaceholder")}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-[var(--text-body)]">
              {t("rememberMe")}
            </span>
          </label>
          <a href="#" className="text-sm text-[var(--accent)] hover:underline">
            {t("forgotPassword")}
          </a>
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--accent)] text-white p-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          {t("loginButton")}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--text-body)]">
          {t("noAccount")}{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">
            {t("signUp")}
          </a>
        </p>
      </div>
    </div>
  );
}
