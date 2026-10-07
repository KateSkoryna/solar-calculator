import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { LuBus, LuSnowflake, LuTruck } from "react-icons/lu";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import SectionIntro from "@/components/home/SectionIntro";
import PageContainer from "@/components/layout/PageContainer";
import {
  SCROLL_REVEAL_CLASSES,
  SCROLL_STAGGER_CLASSES,
} from "@/lib/scroll-animation";

const BUILT_FOR_TITLE_ID = "built-for-title";

interface BuiltForItem {
  key: string;
  Icon: IconType;
  cardClasses: string;
  iconClasses: string;
  onDark: boolean;
}

const BUILT_FOR_ITEMS: BuiltForItem[] = [
  {
    key: "delivery",
    Icon: LuTruck,
    cardClasses: "bg-lime-soft",
    iconClasses: "text-lime-soft-ink",
    onDark: false,
  },
  {
    key: "chilled",
    Icon: LuSnowflake,
    cardClasses: "bg-forest",
    iconClasses: "text-lime",
    onDark: true,
  },
  {
    key: "transit",
    Icon: LuBus,
    cardClasses: "bg-warn-soft",
    iconClasses: "text-warn-ink",
    onDark: false,
  },
];

export default function BuiltFor() {
  const t = useTranslations("home.builtFor");

  return (
    <PageContainer
      as="section"
      labelledBy={BUILT_FOR_TITLE_ID}
      className="flex flex-col gap-10 py-16 md:py-20 lg:py-28"
    >
      <SectionIntro
        eyebrow={t("title")}
        title={t("headline")}
        titleId={BUILT_FOR_TITLE_ID}
      />
      <ul className="grid list-none gap-4 md:grid-cols-3 lg:gap-5">
        {BUILT_FOR_ITEMS.map(
          ({ key, Icon, cardClasses, iconClasses, onDark }, itemIndex) => (
            <li
              key={key}
              className={`mb-0 flex min-h-56 flex-col justify-between gap-6 rounded-2xl p-6 text-left transition duration-200 hover:-translate-y-1 hover:shadow-hover lg:min-h-64 lg:p-8 ${cardClasses} ${SCROLL_REVEAL_CLASSES.zoom} ${SCROLL_STAGGER_CLASSES[itemIndex]}`}
            >
              <Icon
                aria-hidden="true"
                className={`size-14 stroke-[1.4] ${iconClasses}`}
              />
              <div className="flex flex-col gap-2">
                <Heading
                  level={3}
                  size="heading"
                  tone={onDark ? "on-dark" : "ink"}
                >
                  {t(`${key}Title`)}
                </Heading>
                <Text tone={onDark ? "on-dark-muted" : "ink"}>
                  {t(`${key}Body`)}
                </Text>
              </div>
            </li>
          ),
        )}
      </ul>
    </PageContainer>
  );
}
