import type { Role } from "@/app/generated/prisma/enums";
import { fleetMemberApiPath, fleetMembersApiPath } from "@/lib/fleet-api-paths";

export type InviteOutcome = "added" | "invited";

async function sendJsonRequest(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${path} failed`);
  return response.json();
}

export async function inviteMember(
  fleetId: string,
  email: string,
  role: Role,
): Promise<InviteOutcome> {
  const result = await sendJsonRequest(fleetMembersApiPath(fleetId), "POST", {
    email,
    role,
  });
  return "member" in result ? "added" : "invited";
}

export function changeMemberRole(fleetId: string, userId: string, role: Role) {
  return sendJsonRequest(fleetMemberApiPath(fleetId, userId), "PATCH", {
    role,
  });
}

export function removeMember(fleetId: string, userId: string) {
  return sendJsonRequest(fleetMemberApiPath(fleetId, userId), "DELETE");
}
