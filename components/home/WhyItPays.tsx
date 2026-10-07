import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { LuClock, LuLeaf, LuPiggyBank, LuShieldCheck } from "react-icons/lu";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import SectionIntro from "@/components/home/SectionIntro";
import PageContainer from "@/components/layout/PageContainer";
import { WHY_IT_PAYS_SECTION_ID } from "@/lib/public-paths";
import {
  SCROLL_REVEAL_CLASSES,
  SCROLL_STAGGER_CLASSES,
} from "@/lib/scroll-animation";

const WHY_IT_PAYS_TITLE_ID = `${WHY_IT_PAYS_SECTION_ID}-title`;

const VALUE_CARDS: { key: string; Icon: IconType; emphasised: boolean }[] = [
  { key: "costs", Icon: LuPiggyBank, emphasised: false },
  { key: "payback", Icon: LuClock, emphasised: false },
  { key: "co2", Icon: LuLeaf, emphasised: false },
  { key: "trust", Icon: LuShieldCheck, emphasised: true },
];

export default function WhyItPays() {
  const t = useTranslations("home.whyItPays");

  return (
    <PageContainer
      as="section"
      id={WHY_IT_PAYS_SECTION_ID}
      labelledBy={WHY_IT_PAYS_TITLE_ID}
      className="flex scroll-mt-20 lg:scroll-mt-24 flex-col gap-10 py-16 md:py-20 lg:gap-12 lg:py-28"
    >
      <SectionIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        titleId={WHY_IT_PAYS_TITLE_ID}
        lead={t("lead")}
      />
      <ul className="grid list-none gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        {VALUE_CARDS.map(({ key, Icon, emphasised }, cardIndex) => (
          <li
            key={key}
            className={`flex flex-col gap-3.5 rounded-2xl border p-6 text-left transition duration-200 hover:-translate-y-1 hover:shadow-hover xl:p-7 ${
              emphasised
                ? "border-transparent bg-hero"
                : "border-line bg-surface"
            } ${SCROLL_REVEAL_CLASSES.rise} ${SCROLL_STAGGER_CLASSES[cardIndex]}`}
          >
            <span
              className={`flex size-13 items-center justify-center rounded-md ${
                emphasised
                  ? "bg-lime text-on-lime"
                  : "bg-lime-soft text-lime-soft-ink"
              }`}
            >
              <Icon aria-hidden="true" className="size-6.5" />
            </span>
            <Heading
              level={3}
              size="heading"
              tone={emphasised ? "on-dark" : "ink"}
              className="hyphens-auto md:text-lg! xl:text-xl!"
            >
              {t(`${key}Title`)}
            </Heading>
            <Text
              tone={emphasised ? "on-dark-muted" : "muted"}
              className="md:text-[15px]!"
            >
              {t(`${key}Body`)}
            </Text>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
