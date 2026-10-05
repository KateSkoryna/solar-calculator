import { Role } from "@/app/generated/prisma/enums";

export interface RoleDisplay {
  className: string;
  messageKey: string;
}

export const ROLE_MESSAGE_NAMESPACE = "roles";

export const ROLE_DISPLAY: Record<Role, RoleDisplay> = {
  [Role.OWNER]: { className: "bg-ink text-ground", messageKey: "owner" },
  [Role.MANAGER]: {
    className: "bg-lime-soft text-lime-soft-ink",
    messageKey: "manager",
  },
  [Role.VIEWER]: { className: "bg-soft text-muted", messageKey: "viewer" },
};
