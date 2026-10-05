"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LuEllipsis } from "react-icons/lu";
import { Role } from "@/app/generated/prisma/enums";
import Button from "@/components/form/Button";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";
import { ROLE_DISPLAY, ROLE_MESSAGE_NAMESPACE } from "@/lib/role-display";
import { userDisplayName } from "@/lib/user-display-name";
import type { TeamMember } from "./team-member";

const MENU_ITEM_CLASSES = `w-full justify-start rounded-sm px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-soft ${FOCUS_RING_CLASSES}`;

interface MemberRoleMenuProps {
  member: TeamMember;
  onChangeRole: (member: TeamMember, role: Role) => Promise<void>;
  onRemove: (member: TeamMember) => Promise<void>;
}

export default function MemberRoleMenu({
  member,
  onChangeRole,
  onRemove,
}: MemberRoleMenuProps) {
  const t = useTranslations("team");
  const tRoles = useTranslations(ROLE_MESSAGE_NAMESPACE);
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
  const memberName = userDisplayName(member);
  const otherRoles = Object.values(Role).filter((role) => role !== member.role);

  return (
    <details className="group relative">
      <summary
        aria-label={t("memberMenu", { name: memberName })}
        onClick={() => setIsConfirmingRemoval(false)}
        className={`flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-line-strong bg-surface text-ink hover:border-ink [&::-webkit-details-marker]:hidden ${FOCUS_RING_CLASSES}`}
      >
        <LuEllipsis aria-hidden="true" className="size-5" />
      </summary>

      <div className="absolute right-0 top-[calc(100%+6px)] z-50 flex w-56 flex-col gap-1 rounded-md border border-line bg-surface p-2 shadow-hover">
        {isConfirmingRemoval ? (
          <>
            <p className="px-3 py-2 text-sm font-semibold text-ink">
              {t("removeConfirm", { name: memberName })}
            </p>
            <Button variant="danger" size="sm" onClick={() => onRemove(member)}>
              {t("removeConfirmAction")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmingRemoval(false)}
            >
              {t("cancel")}
            </Button>
          </>
        ) : (
          <>
            {otherRoles.map((role) => (
              <Button
                key={role}
                variant="ghost"
                className={MENU_ITEM_CLASSES}
                onClick={() => onChangeRole(member, role)}
              >
                {t("changeRole", {
                  role: tRoles(ROLE_DISPLAY[role].messageKey),
                })}
              </Button>
            ))}
            <Button
              variant="ghost"
              className={`${MENU_ITEM_CLASSES} text-danger`}
              onClick={() => setIsConfirmingRemoval(true)}
            >
              {t("remove")}
            </Button>
          </>
        )}
      </div>
    </details>
  );
}
