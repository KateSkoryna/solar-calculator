"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Role } from "@/app/generated/prisma/enums";
import Button from "@/components/form/Button";
import FormAlert from "@/components/form/FormAlert";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import { inviteMember } from "@/lib/fleet-member-client";
import { ROLE_DISPLAY, ROLE_MESSAGE_NAMESPACE } from "@/lib/role-display";

interface InviteMemberFormProps {
  fleetId: string;
  onInvited: (message: string) => void;
}

const DEFAULT_INVITE_ROLE = Role.VIEWER;

export default function InviteMemberForm({
  fleetId,
  onInvited,
}: InviteMemberFormProps) {
  const t = useTranslations("team");
  const tRoles = useTranslations(ROLE_MESSAGE_NAMESPACE);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(DEFAULT_INVITE_ROLE);
  const [isSending, setIsSending] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  async function submitInvite(event: FormEvent) {
    event.preventDefault();
    setIsSending(true);
    setHasFailed(false);

    try {
      const outcome = await inviteMember(fleetId, email, role);
      onInvited(
        t(outcome === "added" ? "inviteAdded" : "inviteSaved", { email }),
      );
      setEmail("");
      router.refresh();
    } catch {
      setHasFailed(true);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form
      onSubmit={submitInvite}
      className="mb-5 flex flex-col gap-4 rounded-lg bg-soft p-4"
    >
      {hasFailed && <FormAlert>{t("inviteError")}</FormAlert>}
      <Input
        type="email"
        required
        autoComplete="off"
        label={t("inviteEmail")}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Select
        label={t("inviteRole")}
        value={role}
        onChange={(event) => setRole(event.target.value as Role)}
        options={Object.values(Role).map((roleValue) => ({
          value: roleValue,
          label: tRoles(ROLE_DISPLAY[roleValue].messageKey),
        }))}
      />
      <Button type="submit" size="sm" loading={isSending}>
        {isSending ? t("inviteSending") : t("inviteSubmit")}
      </Button>
    </form>
  );
}
