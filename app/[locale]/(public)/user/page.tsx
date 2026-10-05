import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function UserPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [t, tMenu, locale] = await Promise.all([
    getTranslations("user"),
    getTranslations("clientmenu"),
    getLocale(),
  ]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-surface p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-lime-soft-ink mb-6">
          {t("welcome", {
            name: session.user.name || session.user.email || "",
          })}
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-ink">{t("emailLabel")}</p>
            <p className="font-medium text-ink">{session.user.email}</p>
          </div>

          <div>
            <p className="text-sm text-ink">{t("userIdLabel")}</p>
            <p className="font-medium text-ink text-xs break-all">
              {session.user.id}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-line-strong">
          <p className="text-sm text-ink mb-4">{t("protectedNotice")}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: `/${locale}` });
            }}
          >
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
