"use client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--background)" }}
    >
      <main
        className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16"
        style={{ background: "var(--card)" }}
      >
        <div className="w-full flex justify-between items-center mb-8">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="text-center flex-1 flex flex-col items-center justify-center">
          <h1
            className="text-4xl font-black mb-4"
            style={{ color: "var(--text-heading)" }}
          >
            {t("title")}
          </h1>
          <p
            className="text-xl font-[family:var(--font-inter)]"
            style={{ color: "var(--text-body)" }}
          >
            {t("description")}
          </p>
          <div
            className="mt-8 font-bold font-[family:var(--font-inter)] px-6 py-3 rounded-2xl"
            style={{
              background: "var(--primary)",
              color: "var(--text-on-primary)",
            }}
          >
            ✅ {t("deploymentSuccess")}
          </div>
        </div>
      </main>
    </div>
  );
}
