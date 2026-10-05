import { Suspense } from "react";
import SignInPanel from "@/components/auth/SignInPanel";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <SignInPanel mode="register" />
    </Suspense>
  );
}
