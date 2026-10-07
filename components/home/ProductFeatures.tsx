import { useTranslations } from "next-intl";
import { Role } from "@/app/generated/prisma/enums";
import RolePill from "@/components/common/RolePill";
import FeatureRow from "@/components/home/FeatureRow";
import ActivityPreview from "@/components/home/showcase/ActivityPreview";
import CalculatorPreview from "@/components/home/showcase/CalculatorPreview";
import WorkspacePreview from "@/components/home/showcase/WorkspacePreview";
import PageContainer from "@/components/layout/PageContainer";

const FEATURE_POINT_KEYS = ["point1", "point2", "point3"] as const;

export default function ProductFeatures() {
  const t = useTranslations("home.features");
  const pointsOf = (feature: "calculator" | "workspace") =>
    FEATURE_POINT_KEYS.map((pointKey) => t(`${feature}.${pointKey}`));

  return (
    <PageContainer className="flex flex-col gap-18 overflow-x-clip py-16 md:py-20 lg:gap-34 lg:py-30">
      <FeatureRow
        eyebrow={t("calculator.eyebrow")}
        title={t("calculator.title")}
        body={t("calculator.body")}
        points={pointsOf("calculator")}
      >
        <CalculatorPreview />
      </FeatureRow>
      <FeatureRow
        eyebrow={t("workspace.eyebrow")}
        title={t("workspace.title")}
        body={t("workspace.body")}
        points={pointsOf("workspace")}
        previewFirst
      >
        <WorkspacePreview />
      </FeatureRow>
      <FeatureRow
        eyebrow={t("team.eyebrow")}
        title={t("team.title")}
        body={t("team.body")}
        extra={
          <ul className="flex list-none flex-wrap gap-2.5">
            {Object.values(Role).map((role) => (
              <li key={role}>
                <RolePill role={role} />
              </li>
            ))}
          </ul>
        }
      >
        <ActivityPreview />
      </FeatureRow>
    </PageContainer>
  );
}
