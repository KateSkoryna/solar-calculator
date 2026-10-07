import { useTranslations } from "next-intl";
import { LuMail } from "react-icons/lu";
import MockScreen from "@/components/home/showcase/MockScreen";
import { getHomeShowcase } from "@/lib/home-showcase";
import {
  SCROLL_REVEAL_CLASSES,
  SCROLL_STAGGER_CLASSES,
} from "@/lib/scroll-animation";

const INITIALS_LENGTH = 2;
const ACTIVITY_CARD_CLASSES =
  "flex items-center gap-3.5 rounded-lg border border-white/15 bg-white/5 px-4.5 py-4 text-white";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, INITIALS_LENGTH);
}

export default function ActivityPreview() {
  const t = useTranslations();
  const [firstGroup, , latestGroup] = getHomeShowcase().groups;
  const ownerName = t("home.features.team.ownerName");
  const managerName = t("home.features.team.managerName");
  const activityItems = [
    {
      actor: ownerName,
      avatarClasses: "bg-lime text-on-lime",
      sentence: t("audit.events.vehicleCreated", {
        actor: ownerName,
        subject: latestGroup.name,
      }),
      time: t("home.features.team.addedTime"),
    },
    {
      actor: managerName,
      avatarClasses: "bg-sun text-on-lime",
      sentence: t("audit.events.vehicleUpdatedField", {
        actor: managerName,
        field: t("audit.fields.averageDailyDistanceKm"),
        subject: firstGroup.name,
        from: t("home.features.team.changedFrom"),
        to: t("home.features.team.changedTo"),
      }),
      time: t("home.features.team.changedTime"),
    },
    {
      actor: managerName,
      avatarClasses: "bg-sun text-on-lime",
      sentence: t("audit.events.calculationCreated", { actor: managerName }),
      time: t("home.features.team.changedTime"),
    },
  ];

  return (
    <div className="flex flex-col gap-3.5 rounded-[36px] bg-hero p-5 text-left md:p-10 lg:p-12">
      <MockScreen
        label={t("home.features.team.previewLabel")}
        className="flex flex-col gap-3.5"
      >
        {activityItems.map(
          ({ actor, avatarClasses, sentence, time }, itemIndex) => (
            <div
              key={sentence}
              className={`${ACTIVITY_CARD_CLASSES} ${SCROLL_REVEAL_CLASSES.rise} ${SCROLL_STAGGER_CLASSES[itemIndex]}`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarClasses}`}
              >
                {initialsOf(actor)}
              </span>
              <span className="flex flex-col gap-0.5 text-[15px]">
                <span>{sentence}</span>
                <span className="text-[13px] text-hero-muted">
                  {time} · {t("home.sampleData")}
                </span>
              </span>
            </div>
          ),
        )}
      </MockScreen>
      <div
        className={`flex items-center gap-3.5 rounded-lg bg-lime px-4.5 py-4 text-on-lime ${SCROLL_REVEAL_CLASSES.rise} ${SCROLL_STAGGER_CLASSES[3]}`}
      >
        <LuMail aria-hidden="true" className="size-6 shrink-0" />
        <span className="text-[15px] font-semibold">
          {t("home.features.team.signIn")}
        </span>
      </div>
    </div>
  );
}
