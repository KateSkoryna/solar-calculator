import type { ReactNode } from "react";
import AuthShell from "@/components/auth/AuthShell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1">
      <AuthShell>{children}</AuthShell>
    </main>
  );
}
