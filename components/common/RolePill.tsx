import { useTranslations } from "next-intl";
import type { Role } from "@/app/generated/prisma/enums";
import { ROLE_DISPLAY, ROLE_MESSAGE_NAMESPACE } from "@/lib/role-display";

interface RolePillProps {
  role: Role;
}

export default function RolePill({ role }: RolePillProps) {
  const t = useTranslations(ROLE_MESSAGE_NAMESPACE);
  const { className, messageKey } = ROLE_DISPLAY[role];

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 text-[13px] font-semibold ${className}`}
    >
      {t(messageKey)}
    </span>
  );
}
