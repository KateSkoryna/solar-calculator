import { useTranslations } from "next-intl";
import Card from "@/components/common/Card";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import AddVehiclesLink from "@/components/fleet/AddVehiclesLink";

interface FleetEmptyStateProps {
  canAddVehicles: boolean;
  addVehiclesPath: string;
}

export default function FleetEmptyState({
  canAddVehicles,
  addVehiclesPath,
}: FleetEmptyStateProps) {
  const t = useTranslations("overview.empty");

  return (
    <Card as="section" className="flex flex-col items-start gap-4">
      <Heading level={2} size="title">
        {t("title")}
      </Heading>
      <Text tone="muted">
        {canAddVehicles ? t("textForEditors") : t("textForViewers")}
      </Text>
      {canAddVehicles && <AddVehiclesLink href={addVehiclesPath} />}
    </Card>
  );
}
