import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import SignInPanel from "@/components/auth/SignInPanel";

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <SignInPanel mode="login" />
      </Suspense>
    </AuthShell>
  );
}
