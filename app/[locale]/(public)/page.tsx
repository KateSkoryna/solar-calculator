import BuiltFor from "@/components/home/BuiltFor";
import ClosingCta from "@/components/home/ClosingCta";
import HomeHero from "@/components/home/HomeHero";
import HowItWorks from "@/components/home/HowItWorks";
import MobileShowcase from "@/components/home/MobileShowcase";
import ProductFeatures from "@/components/home/ProductFeatures";
import ResultShowcase from "@/components/home/ResultShowcase";
import WhyItPays from "@/components/home/WhyItPays";

export default function Home() {
  return (
    <>
      <HomeHero />
      <WhyItPays />
      <ResultShowcase />
      <ProductFeatures />
      <MobileShowcase />
      <BuiltFor />
      <HowItWorks />
      <ClosingCta />
    </>
  );
}
