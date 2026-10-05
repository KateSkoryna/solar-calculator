import { redirect } from "next/navigation";
import { fleetOverviewPath } from "@/lib/workspace-path";

export default async function FleetRootPage({
  params,
}: {
  params: Promise<{ locale: string; fleetSlug: string }>;
}) {
  const { locale, fleetSlug } = await params;
  redirect(fleetOverviewPath(locale, fleetSlug));
}
