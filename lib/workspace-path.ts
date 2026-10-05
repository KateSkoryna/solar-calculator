export function workspacePath(locale: string) {
  return `/${locale}/workspace`;
}

export function onboardingPath(locale: string) {
  return `/${locale}/onboarding`;
}

export function fleetCalculationPath(
  locale: string,
  fleetSlug: string,
  calculationId: string,
) {
  return `/${locale}/${fleetSlug}/calculations/${calculationId}`;
}

export function fleetOverviewPath(locale: string, fleetSlug: string) {
  return `/${locale}/${fleetSlug}/overview`;
}
