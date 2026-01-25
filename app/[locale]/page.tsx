import Container from "@/components/layout/Container";
import ImageBackground from "@/components/home/ImageBackground";
import HeroSection from "@/components/home/HeroSection";
import { useTranslations } from "next-intl";
import Link from "next/link";

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
  ];

  return (
    <>
      <ImageBackground image="/forestlight.webp" />

      {/* Hero Section with forestlight background */}
      <HeroSection>
        <Container>
          <div className="mx-auto max-w-4xl text-center p-12">
            <h1 className="!text-[var(--accent)] text-center mb-6">
              {t("title")}
            </h1>

            <p className="mb-12 text-xl font-[family:var(--font-inter)] text-[var(--text-body)]">
              {t("description")}
            </p>

            <div className="flex flex-col items-start gap-6">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="w-1/2 bg-[var(--card)] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                >
                  <h3 className="text-2xl font-semibold text-[var(--text-heading)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-body)]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-left">
              <Link
                href="/calculator"
                className="inline-block bg-[var(--accent)] text-white px-16 py-6 rounded-full font-large text-lg hover:opacity-90 transition-opacity"
              >
                {t("getStarted")}
              </Link>
            </div>
          </div>
        </Container>
      </HeroSection>

      {/* Additional content sections */}
      <Container>
        <div className="mx-auto max-w-4xl py-16">
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

        <div className="mx-auto max-w-4xl py-16">
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

        <div className="mx-auto max-w-4xl py-16 mb-16">
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
