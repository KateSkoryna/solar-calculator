import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UserPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[var(--form-bg)] p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-[var(--accent)] mb-6">
          Welcome, {session.user.name || session.user.email}!
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-[var(--text-body)]">Email:</p>
            <p className="font-medium text-[var(--text-body)]">
              {session.user.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-[var(--text-body)]">User ID:</p>
            <p className="font-medium text-[var(--text-body)] text-xs break-all">
              {session.user.id}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-body)] mb-4">
            Logged in successfully! This page is protected.
          </p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full bg-red-500 text-white p-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
