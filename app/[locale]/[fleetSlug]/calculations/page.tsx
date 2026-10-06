import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import Card from "@/components/common/Card";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import { LuPlus } from "react-icons/lu";
import ButtonLink from "@/components/form/ButtonLink";
import AddVehiclesLink from "@/components/fleet/AddVehiclesLink";
import CalculationHistoryList from "@/components/fleet/CalculationHistoryList";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { FLEET_EDITOR_ROLES } from "@/lib/fleet-auth";
import { loadFleetCalculationHistory } from "@/lib/fleet-calculation-history";
import { loadFleetPageAccess } from "@/lib/fleet-page-access";
import { loginPath } from "@/lib/public-paths";
import { fleetNewVehiclePath } from "@/lib/workspace-path";

export default async function FleetCalculationsPage({
  params,
}: {
  params: Promise<{ locale: string; fleetSlug: string }>;
}) {
  const { locale, fleetSlug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(loginPath(locale));
  }

  const pageAccess = await loadFleetPageAccess(session, fleetSlug);

  if (!pageAccess) {
    notFound();
  }

  const canAddVehicles = FLEET_EDITOR_ROLES.includes(pageAccess.access.role);
  const t = await getTranslations("calculations");
  const rows = await loadFleetCalculationHistory(pageAccess.fleet.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading level={1} size="display-s">
          {t("title")}
        </Heading>
        {canAddVehicles && rows.length > 0 && (
          <ButtonLink
            href={fleetNewVehiclePath(locale, fleetSlug)}
            size="sm"
            icon={<LuPlus aria-hidden="true" className="size-4" />}
          >
            {t("new")}
          </ButtonLink>
        )}
      </div>

      {rows.length === 0 ? (
        <Card as="section" className="flex flex-col items-start gap-4">
          <Heading level={2} size="title">
            {t("empty.title")}
          </Heading>
          <Text tone="muted">
            {canAddVehicles
              ? t("empty.textForEditors")
              : t("empty.textForViewers")}
          </Text>
          {canAddVehicles && (
            <AddVehiclesLink href={fleetNewVehiclePath(locale, fleetSlug)} />
          )}
        </Card>
      ) : (
        <CalculationHistoryList
          rows={rows}
          currentAssumptionSetVersion={ASSUMPTION_SET_V1.version}
          locale={locale}
          fleetSlug={fleetSlug}
        />
      )}
    </div>
  );
}
