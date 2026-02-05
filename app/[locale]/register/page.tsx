import RegisterForm from "@/components/register/Form";
import Section from "@/components/layout/Section";

export default function RegisterPage() {
  return (
    <Section>
      <div className="mx-auto max-w-md">
        <RegisterForm />
      </div>
    </Section>
  );
}
