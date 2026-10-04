"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { workspacePath } from "@/lib/workspace-path";

const INPUT_CLASS_NAME =
  "w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]";

export default function OnboardingForm() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setHasError(false);

    try {
      const response = await fetch("/api/fleets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          userName: userName.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error("Fleet creation failed");

      router.push(workspacePath(locale));
    } catch {
      setHasError(true);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {t("error")}
        </div>
      )}

      <div>
        <label
          htmlFor="onboarding-user-name"
          className="block text-sm font-medium text-[var(--text-body)] mb-2"
        >
          {t("userName")}
        </label>
        <input
          id="onboarding-user-name"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          maxLength={80}
          disabled={isSaving}
          className={INPUT_CLASS_NAME}
        />
      </div>

      <div>
        <label
          htmlFor="onboarding-company-name"
          className="block text-sm font-medium text-[var(--text-body)] mb-2"
        >
          {t("companyName")}
        </label>
        <input
          id="onboarding-company-name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          required
          minLength={2}
          maxLength={80}
          disabled={isSaving}
          className={INPUT_CLASS_NAME}
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-[var(--accent)] text-white p-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? t("saving") : t("submit")}
      </button>
    </form>
  );
}
