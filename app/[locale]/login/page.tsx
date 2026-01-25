import Container from "@/components/layout/Container";
import { useTranslations } from "next-intl";

export default function Login() {
  const t = useTranslations("login");

  return (
    <Container>
      <div className="mx-auto max-w-md py-12">
          <div className="bg-[var(--card)] p-8 rounded-lg shadow-md">
            <h1 className="!text-[var(--accent)] text-center mb-6">
              {t("title")}
            </h1>

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
                <a
                  href="#"
                  className="text-sm text-[var(--accent)] hover:underline"
                >
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
        </div>
    </Container>
  );
}
