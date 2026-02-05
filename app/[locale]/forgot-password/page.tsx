import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Section from "@/components/layout/Section";

export default function ForgotPasswordPage() {
  return (
    <Section>
      <div className="mx-auto max-w-md">
        <ForgotPasswordForm />
      </div>
    </Section>
  );
}
