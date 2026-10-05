import { Suspense } from "react";
import SignInPanel from "@/components/auth/SignInPanel";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <SignInPanel mode="login" />
    </Suspense>
  );
}
