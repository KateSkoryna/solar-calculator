import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  requireFleetRole,
  ANY_FLEET_ROLE,
  ForbiddenError,
} from "@/lib/fleet-auth";
import { findFleetBySlug } from "@/lib/fleet-repo";
import Section from "@/components/layout/Section";
import PageTitle from "@/components/common/PageTitle";
import StatTile from "@/components/calculation/StatTile";
import ProvenancePanel from "@/components/calculation/ProvenancePanel";

function NotFoundMessage({ title, text }: { title: string; text: string }) {
  return (
    <Section>
      <PageTitle>{title}</PageTitle>
      <p className="text-center text-[var(--text-body)]">{text}</p>
    </Section>
  );
}

export default async function CalculationResultPage({
  params,
}: {
  params: Promise<{ fleetSlug: string; calculationId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const t = await getTranslations("calculation");
  const { fleetSlug, calculationId } = await params;
  const fleet = await findFleetBySlug(fleetSlug);

  if (!fleet) {
    return <NotFoundMessage title={t("notFoundTitle")} text={t("notFound")} />;
  }

  try {
    await requireFleetRole(session, fleet.id, ANY_FLEET_ROLE);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <NotFoundMessage title={t("notFoundTitle")} text={t("notFound")} />
      );
    }
    throw error;
  }

  const calculation = await prisma.calculation.findFirst({
    where: { id: calculationId, fleetId: fleet.id },
    select: {
      createdAt: true,
      vehicle: { select: { manufacturer: true, model: true } },
      requestedByUser: { select: { name: true, email: true } },
      scenario: {
        select: {
          formulaVersion: true,
          assumptionSetVersion: true,
          inputSnapshot: {
            select: {
              capturedAt: true,
              energyPriceAssumptionVersion: true,
              emissionsFactorVersion: true,
              solarYieldAssumptionVersion: true,
              currencyConversionSourceVersion: true,
            },
          },
          result: {
            select: {
              paybackPeriodMonths: true,
              totalSolarYieldKwh: true,
              co2SavedKg: true,
              netSavingsAmount: true,
              currency: true,
              computedAt: true,
            },
          },
        },
      },
    },
  });

  if (!calculation) {
    return <NotFoundMessage title={t("notFoundTitle")} text={t("notFound")} />;
  }

  const { scenario } = calculation;

  if (!scenario || !scenario.inputSnapshot || !scenario.result) {
    return (
      <NotFoundMessage title={t("notFoundTitle")} text={t("noResultYet")} />
    );
  }

  const { inputSnapshot, result } = scenario;

  return (
    <Section>
      <PageTitle>
        {calculation.vehicle.manufacturer} {calculation.vehicle.model}
      </PageTitle>

      <div className="mx-auto mb-10 grid w-full max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
        <StatTile
          label={t("paybackPeriod")}
          value={`${result.paybackPeriodMonths.toFixed(1)} ${t("paybackUnit")}`}
          tooltip={t("paybackPeriodTooltip")}
        />
        <StatTile
          label={t("solarYield")}
          value={`${result.totalSolarYieldKwh.toFixed(0)} kWh`}
          tooltip={t("solarYieldTooltip")}
        />
        <StatTile
          label={t("co2Saved")}
          value={`${result.co2SavedKg.toFixed(0)} kg`}
          tooltip={t("co2SavedTooltip")}
        />
        <StatTile
          label={t("netSavings")}
          value={`${Number(result.netSavingsAmount).toFixed(2)} ${result.currency}`}
          tooltip={t("netSavingsTooltip")}
        />
      </div>

      <ProvenancePanel
        actorLabel={
          calculation.requestedByUser.name ?? calculation.requestedByUser.email
        }
        calculatedAt={result.computedAt}
        formulaVersion={scenario.formulaVersion}
        assumptionSetVersion={scenario.assumptionSetVersion}
        inputSnapshotCapturedAt={inputSnapshot.capturedAt}
        energyPriceAssumptionVersion={
          inputSnapshot.energyPriceAssumptionVersion
        }
        emissionsFactorVersion={inputSnapshot.emissionsFactorVersion}
        solarYieldAssumptionVersion={inputSnapshot.solarYieldAssumptionVersion}
        currencyConversionSourceVersion={
          inputSnapshot.currencyConversionSourceVersion
        }
      />
    </Section>
  );
}
