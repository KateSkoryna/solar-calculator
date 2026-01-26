import Container from "@/components/layout/Container";
import HeroSection from "@/components/home/HeroSection";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Background from "@/components/home/Background";
import PageTitle from "@/components/common/PageTitle";
import Section from "@/components/layout/Section";

export default function Home() {
  const t = useTranslations("home");

  const features = [
    {
      id: "feature1",
      title: t("feature1Title"),
      description: t("feature1Description"),
    },
    {
      id: "feature2",
      title: t("feature2Title"),
      description: t("feature2Description"),
    },
    {
      id: "feature3",
      title: t("feature3Title"),
      description: t("feature3Description"),
    },
    {
      id: "feature4",
      title: t("feature4Title"),
      description: t("feature4Description"),
    },
  ];

  return (
    <>
      <Background />
      <HeroSection>
        <Container>
          <Section>
            <PageTitle>{t("title")}</PageTitle>

            <p className="mb-8 text-xl font-[family:var(--font-inter)] text-white md:text-[var(--description-text)]">
              {t("description")}
            </p>

            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:flex lg:flex-col lg:items-start">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-[var(--card)] p-3 md:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left lg:w-1/2 flex flex-col"
                >
                  <h3 className="text-base md:text-base lg:text-2xl font-semibold text-[var(--text-heading)] mb-2 md:mb-3 h-12 md:h-12 lg:h-auto overflow-hidden text-center lg:text-left">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-base text-[var(--text-body)] flex-1">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center lg:text-left">
              <Link
                href="/calculator"
                className="inline-block bg-[var(--accent)] text-white px-16 py-6 rounded-full font-large text-lg hover:opacity-90 transition-opacity"
              >
                {t("getStarted")}
              </Link>
            </div>
          </Section>
        </Container>
      </HeroSection>

      <Container>
        <div className="mx-auto max-w-4xl py-8 md:py-12 lg:py-16">
          <h2 className="text-3xl font-bold text-[var(--text-heading)] mb-6">
            Why Choose Solar Panels?
          </h2>
          <p className="text-lg text-[var(--text-body)] mb-6">
            Solar panels for commercial vehicles offer numerous benefits that go
            beyond just environmental impact. They provide a sustainable and
            cost-effective solution for fleet operators looking to reduce
            operating costs.
          </p>
          <ul className="space-y-3 text-[var(--text-body)] mb-8">
            <li>Reduce fuel consumption and operating costs</li>
            <li>Lower carbon footprint and environmental impact</li>
            <li>Increase vehicle range with auxiliary power</li>
            <li>Power onboard systems without idling</li>
            <li>Improve battery life and reliability</li>
          </ul>
        </div>

        <div className="mx-auto max-w-4xl py-8 md:py-12 lg:py-16">
          <h2 className="text-3xl font-bold text-[var(--text-heading)] mb-6">
            Our Calculation Process
          </h2>
          <p className="text-lg text-[var(--text-body)] mb-6">
            We use advanced algorithms to calculate the optimal solar panel
            configuration for your specific vehicle type and usage patterns. Our
            process takes into account multiple factors to ensure accurate
            recommendations.
          </p>
          <ol className="space-y-3 text-[var(--text-body)] mb-8">
            <li>1. Analyze your vehicle specifications and roof area</li>
            <li>2. Calculate average daily energy consumption</li>
            <li>3. Determine optimal panel size and placement</li>
            <li>4. Estimate cost savings and ROI timeline</li>
            <li>5. Provide detailed environmental impact report</li>
          </ol>
          <p className="text-lg text-[var(--text-body)]">
            Get started today and discover how much you can save with solar
            power for your commercial fleet. Our calculator provides instant
            results with detailed breakdowns of your potential savings.
          </p>
        </div>

        <div className="mx-auto max-w-4xl py-8 md:py-12 lg:py-16">
          <h2 className="text-3xl font-bold text-[var(--text-heading)] mb-6">
            Industries We Serve
          </h2>
          <p className="text-lg text-[var(--text-body)] mb-6">
            Our solar solutions are designed for a wide range of commercial
            vehicle applications across multiple industries.
          </p>
          <ul className="space-y-3 text-[var(--text-body)]">
            <li>Logistics and delivery services</li>
            <li>Public transportation and shuttle services</li>
            <li>Refrigerated transport and cold chain</li>
            <li>Mobile workshops and service vehicles</li>
            <li>Emergency and utility services</li>
            <li>Tourism and recreational vehicles</li>
          </ul>
        </div>
      </Container>
    </>
  );
}
