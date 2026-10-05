"use client";

import type { IconType } from "react-icons";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { LuCalculator, LuTruck, LuUsers } from "react-icons/lu";
import Text from "@/components/common/Text";
import { AuditEntityType } from "@/lib/audit";
import { formatActivityTime } from "@/lib/activity-time";
import {
  buildActivitySentences,
  type ActivityEvent,
} from "@/lib/activity-sentences";

const ENTITY_ICONS: Record<AuditEntityType, IconType> = {
  [AuditEntityType.FLEET]: LuUsers,
  [AuditEntityType.VEHICLE]: LuTruck,
  [AuditEntityType.CALCULATION]: LuCalculator,
  [AuditEntityType.MEMBERSHIP]: LuUsers,
  [AuditEntityType.INVITATION]: LuUsers,
};

interface ActivityItemProps {
  event: ActivityEvent;
  now: Date;
}

export default function ActivityItem({ event, now }: ActivityItemProps) {
  const translate = useTranslations();
  const format = useFormatter();
  const locale = useLocale();
  const Icon = ENTITY_ICONS[event.entityType];
  const sentences = buildActivitySentences(event, {
    translate,
    locale,
    formatNumber: format.number,
  });
  const timestamp = formatActivityTime(new Date(event.createdAt), now, {
    translate,
    formatDateTime: format.dateTime,
  });

  return (
    <li className="mb-0 flex items-start gap-3 border-t border-line py-4 first:border-t-0 first:pt-0">
      <span
        aria-hidden="true"
        className="flex size-[34px] shrink-0 items-center justify-center rounded-sm bg-soft text-ink"
      >
        <Icon className="size-[18px]" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        {sentences.map((sentence) => (
          <Text key={sentence} size="body">
            {sentence}
          </Text>
        ))}
        <Text as="time" size="caption" tone="muted">
          {timestamp}
        </Text>
      </div>
    </li>
  );
}
