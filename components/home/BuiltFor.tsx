import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { LuBus, LuSnowflake, LuTruck } from "react-icons/lu";
import Heading from "@/components/common/Heading";
import IconFeature from "@/components/common/IconFeature";
import PageContainer from "@/components/layout/PageContainer";

const BUILT_FOR_TITLE_ID = "built-for-title";

const BUILT_FOR_ITEMS: { key: string; Icon: IconType }[] = [
  { key: "delivery", Icon: LuTruck },
  { key: "transit", Icon: LuBus },
  { key: "chilled", Icon: LuSnowflake },
];

export default function BuiltFor() {
  const t = useTranslations("home.builtFor");

  return (
    <PageContainer as="section" labelledBy={BUILT_FOR_TITLE_ID}>
      <div className="grid gap-6 rounded-2xl bg-forest p-6 text-left md:p-10 lg:grid-cols-4 lg:gap-8 lg:p-12">
        <Heading
          level={2}
          size="display-s"
          tone="on-dark"
          id={BUILT_FOR_TITLE_ID}
        >
          {t("title")}
        </Heading>
        <ul className="grid list-none gap-5 md:grid-cols-3 md:gap-6 lg:col-span-3">
          {BUILT_FOR_ITEMS.map(({ key, Icon }) => (
            <IconFeature
              key={key}
              Icon={Icon}
              title={t(`${key}Title`)}
              body={t(`${key}Body`)}
            />
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}
