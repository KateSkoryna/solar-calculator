import Container from "@/components/layout/Container";
import { useTranslations } from "next-intl";
import Link from "next/link";
import PageTitle from "@/components/common/PageTitle";
import HeroSectionCover from "@/components/layout/Section";
import CardCarousel from "@/components/home/CardCarousel";

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
    <div className="flex flex-col gap-4 md:gap-8 lg:gap-8 w-full">
      <HeroSectionCover>
        <PageTitle>{t("title")}</PageTitle>

        <p className="mb-8 text-xl font-[family:var(--font-inter)] text-[var(--text-white)]">
          {t("description")}
        </p>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:flex lg:flex-col lg:items-center">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left lg:w-1/2 flex flex-col border border-white/20"
            >
              <h3 className="text-base md:text-base lg:text-2xl font-semibold !text-[var(--text-white)] mb-2 md:mb-3 h-12 md:h-12 lg:h-auto overflow-hidden text-center lg:text-left">
                {feature.title}
              </h3>
              <p className="text-xs md:text-base text-[var(--text-white)] flex-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/calculator"
          className="mt-8 text-center lg:text-left inline-block bg-[var(--primary)] text-[var(--text-on-primary)] px-16 py-6 rounded-full font-large text-lg hover:opacity-90 transition-opacity"
        >
          {t("getStarted")}
        </Link>
      </HeroSectionCover>

      <Container>
        <CardCarousel />
      </Container>
    </div>
  );
}
