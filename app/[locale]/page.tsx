import BuiltFor from "@/components/home/BuiltFor";
import HomeHero from "@/components/home/HomeHero";
import HowItWorks from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 py-8 md:gap-14 md:py-12 lg:gap-[72px] lg:py-16">
      <HomeHero />
      <HowItWorks />
      <BuiltFor />
    </div>
  );
}
