import { Suspense } from "react";
import Form from "@/components/login/Form";
import Section from "@/components/layout/Section";

export default async function Login() {
  return (
    <Section>
      <div className="mx-auto max-w-md">
        <Suspense fallback={null}>
          <Form />
        </Suspense>
      </div>
    </Section>
  );
}
