import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function UserPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [t, tMenu] = await Promise.all([
    getTranslations("user"),
    getTranslations("clientmenu"),
  ]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-[var(--accent)] mb-6">
          {t("welcome", {
            name: session.user.name || session.user.email || "",
          })}
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-[var(--text-body)]">{t("emailLabel")}</p>
            <p className="font-medium text-[var(--text-body)]">
              {session.user.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-[var(--text-body)]">
              {t("userIdLabel")}
            </p>
            <p className="font-medium text-[var(--text-body)] text-xs break-all">
              {session.user.id}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-body)] mb-4">
            {t("protectedNotice")}
          </p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full bg-red-500 text-white p-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              {tMenu("logout")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
