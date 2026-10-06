export const FLEETS_API_PATH = "/api/fleets";

export function fleetQuickChecksApiPath(fleetId: string) {
  return `${FLEETS_API_PATH}/${fleetId}/quick-checks`;
}

export function fleetMembersApiPath(fleetId: string) {
  return `${FLEETS_API_PATH}/${fleetId}/members`;
}

export function fleetMemberApiPath(fleetId: string, userId: string) {
  return `${fleetMembersApiPath(fleetId)}/${userId}`;
}

export function fleetAuditEventsApiPath(fleetId: string) {
  return `${FLEETS_API_PATH}/${fleetId}/audit-events`;
}

export function fleetVehiclesApiPath(fleetId: string) {
  return `${FLEETS_API_PATH}/${fleetId}/vehicles`;
}

export function fleetVehicleApiPath(fleetId: string, vehicleId: string) {
  return `${fleetVehiclesApiPath(fleetId)}/${vehicleId}`;
}

export function fleetCalculationsApiPath(fleetId: string) {
  return `${FLEETS_API_PATH}/${fleetId}/calculations`;
}
