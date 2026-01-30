import Container from "@/components/layout/Container";
import { useTranslations } from "next-intl";
import PageTitle from "@/components/common/PageTitle";
import Section from "@/components/layout/Section";
import MultiStepForm from "@/components/calculator/MultiStepForm";

export default function Calculator() {
  const t = useTranslations("calculator");

  return (
    <>
      <section className="relative">
        <div
          className="absolute top-1/2 -translate-y-1/2
        left-1/2 -translate-x-1/2
        w-full h-full
        -z-10 overflow-hidden

        lg:left-auto lg:-translate-x-0 lg:right-8
        lg:w-[40%]"
        >
          <img
            src="/bus.webp"
            alt="Bus"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <Container>
          <Section className="text-left">
            <PageTitle>{t("title")}</PageTitle>

            <div className="w-full mx-auto md:w-3/4 lg:w-1/2 lg:mx-0">
              <div className="bg-[var(--form-bg)] p-6 rounded-lg shadow-md">
                <p className="text-lg font-[family:var(--font-inter)] text-[var(--text-body)] mb-6">
                  {t("description")}
                </p>

                <MultiStepForm />
              </div>
            </div>
          </Section>
        </Container>
      </section>
    </>
  );
}
