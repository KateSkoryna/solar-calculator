import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Section from "@/components/layout/Section";

export default function ResetPasswordPage() {
  return (
    <Section>
      <div className="mx-auto max-w-md">
        <ResetPasswordForm />
      </div>
    </Section>
  );
}
