"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Role } from "@/app/generated/prisma/enums";
import Avatar from "@/components/common/Avatar";
import Card from "@/components/common/Card";
import RolePill from "@/components/common/RolePill";
import Text from "@/components/common/Text";
import Button from "@/components/form/Button";
import FormAlert from "@/components/form/FormAlert";
import { changeMemberRole, removeMember } from "@/lib/fleet-member-client";
import { ROLE_DISPLAY, ROLE_MESSAGE_NAMESPACE } from "@/lib/role-display";
import { userDisplayName } from "@/lib/user-display-name";
import InviteMemberForm from "./InviteMemberForm";
import MemberRoleMenu from "./MemberRoleMenu";
import type { TeamMember } from "./team-member";

interface TeamCardProps {
  fleetId: string;
  members: TeamMember[];
  currentUserId: string;
  canManageTeam: boolean;
}

export default function TeamCard({
  fleetId,
  members,
  currentUserId,
  canManageTeam,
}: TeamCardProps) {
  const t = useTranslations("team");
  const tRoles = useTranslations(ROLE_MESSAGE_NAMESPACE);
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [hasActionFailed, setHasActionFailed] = useState(false);

  async function updateTeam(action: () => Promise<unknown>) {
    setHasActionFailed(false);
    try {
      await action();
      router.refresh();
    } catch {
      setHasActionFailed(true);
    }
  }

  const changeRole = (member: TeamMember, role: Role) =>
    updateTeam(() => changeMemberRole(fleetId, member.userId, role));
  const remove = (member: TeamMember) =>
    updateTeam(() => removeMember(fleetId, member.userId));

  return (
    <Card
      as="section"
      title={t("title", { count: members.length })}
      action={
        canManageTeam && (
          <Button
            size="sm"
            aria-expanded={isInviteOpen}
            onClick={() => setIsInviteOpen(!isInviteOpen)}
          >
            {t("invite")}
          </Button>
        )
      }
    >
      {canManageTeam && isInviteOpen && (
        <InviteMemberForm fleetId={fleetId} onInvited={setInviteMessage} />
      )}
      {inviteMessage && (
        <p role="status" className="mb-4 text-[15px] font-semibold text-ink">
          {inviteMessage}
        </p>
      )}
      {hasActionFailed && (
        <div className="mb-4">
          <FormAlert>{t("actionError")}</FormAlert>
        </div>
      )}

      <ul aria-label={t("members")} className="m-0 flex list-none flex-col p-0">
        {members.map((member) => (
          <li
            key={member.userId}
            className="flex items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0"
          >
            <Avatar
              name={userDisplayName(member)}
              imageUrl={member.imageUrl}
              tone="neutral"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <Text className="truncate font-semibold">
                {userDisplayName(member)}
                {member.userId === currentUserId && ` (${t("you")})`}
              </Text>
              <Text size="small" tone="muted" className="truncate">
                {member.email}
              </Text>
            </div>
            <RolePill role={member.role} />
            {canManageTeam && member.userId !== currentUserId && (
              <MemberRoleMenu
                member={member}
                onChangeRole={changeRole}
                onRemove={remove}
              />
            )}
          </li>
        ))}
      </ul>

      <dl className="mt-5 flex flex-col gap-2 border-t border-line pt-4">
        {Object.values(Role).map((role) => {
          const { messageKey } = ROLE_DISPLAY[role];
          return (
            <Text as="div" key={role} size="small" tone="muted">
              <dt className="inline font-semibold text-ink">
                {tRoles(messageKey)}
                <span aria-hidden="true" className="font-normal text-muted">
                  {" — "}
                </span>
              </dt>
              <dd className="inline">{t(`roleExplainer.${messageKey}`)}</dd>
            </Text>
          );
        })}
      </dl>
    </Card>
  );
}
