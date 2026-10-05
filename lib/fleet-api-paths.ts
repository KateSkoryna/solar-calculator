export const FLEETS_API_PATH = "/api/fleets";

export function fleetQuickChecksApiPath(fleetId: string) {
  return `${FLEETS_API_PATH}/${fleetId}/quick-checks`;
}
