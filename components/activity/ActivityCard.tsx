"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/common/Card";
import Disclosure from "@/components/common/Disclosure";
import Text from "@/components/common/Text";
import Button from "@/components/form/Button";
import ChipGroup from "@/components/form/ChipGroup";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import {
  ACTIVITY_FILTERS,
  ACTIVITY_FILTER_KEYS,
  DEFAULT_ACTIVITY_FILTER,
  type ActivityFilterKey,
} from "@/lib/activity-filters";
import type { ActivityEvent } from "@/lib/activity-sentences";
import { DEFAULT_AUDIT_EVENT_PAGE_SIZE } from "@/lib/audit-event-constants";
import { fleetAuditEventsApiPath } from "@/lib/fleet-api-paths";
import ActivityItem from "./ActivityItem";

export interface ActivityUserOption {
  id: string;
  label: string;
}

interface ActivityResponse {
  events: ActivityEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface ActivityCardProps {
  fleetId: string;
  users: ActivityUserOption[];
}

const FIRST_PAGE = 1;
const ALL_USERS_VALUE = "";
const FILTER_RADIO_GROUP_NAME = "activity-filter";

function toStartOfLocalDayISOString(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toISOString();
}

function toEndOfLocalDayISOString(dateString: string) {
  return new Date(`${dateString}T23:59:59.999`).toISOString();
}

export default function ActivityCard({ fleetId, users }: ActivityCardProps) {
  const t = useTranslations("audit");
  const [activeFilter, setActiveFilter] = useState<ActivityFilterKey>(
    DEFAULT_ACTIVITY_FILTER,
  );
  const [actorUserId, setActorUserId] = useState(ALL_USERS_VALUE);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(FIRST_PAGE);

  const { data, isLoading, isError } = useQuery<ActivityResponse>({
    queryKey: [
      "audit-events",
      fleetId,
      activeFilter,
      actorUserId,
      from,
      to,
      page,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(DEFAULT_AUDIT_EVENT_PAGE_SIZE),
      });
      ACTIVITY_FILTERS[activeFilter].forEach((entityType) =>
        queryParams.append("entityType", entityType),
      );
      if (actorUserId) queryParams.set("actorUserId", actorUserId);
      if (from) queryParams.set("from", toStartOfLocalDayISOString(from));
      if (to) queryParams.set("to", toEndOfLocalDayISOString(to));

      const response = await fetch(
        `${fleetAuditEventsApiPath(fleetId)}?${queryParams.toString()}`,
      );
      if (!response.ok) throw new Error("Activity request failed");
      return response.json();
    },
  });

  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalCount / data.pageSize))
    : 1;
  const now = new Date();

  function applyFilter<Value>(setFilter: (value: Value) => void, value: Value) {
    setFilter(value);
    setPage(FIRST_PAGE);
  }

  return (
    <Card as="section" title={t("activityTitle")}>
      <div className="flex flex-col gap-5">
        <ChipGroup
          name={FILTER_RADIO_GROUP_NAME}
          label={t("filters.label")}
          options={ACTIVITY_FILTER_KEYS.map((key) => ({
            value: key,
            label: t(`filters.${key}`),
          }))}
          value={activeFilter}
          onChange={(key) => applyFilter(setActiveFilter, key)}
        />

        <Disclosure summary={t("moreFilters")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Select
                compact
                label={t("user")}
                value={actorUserId}
                onChange={(event) =>
                  applyFilter(setActorUserId, event.target.value)
                }
                options={[
                  { value: ALL_USERS_VALUE, label: t("allUsers") },
                  ...users.map(({ id: userId, label }) => ({
                    value: userId,
                    label,
                  })),
                ]}
              />
            </div>
            <Input
              compact
              type="date"
              label={t("from")}
              value={from}
              onChange={(event) => applyFilter(setFrom, event.target.value)}
            />
            <Input
              compact
              type="date"
              label={t("to")}
              value={to}
              onChange={(event) => applyFilter(setTo, event.target.value)}
            />
          </div>
        </Disclosure>

        {isLoading && <Text tone="muted">{t("loading")}</Text>}
        {isError && (
          <div role="alert">
            <Text className="text-danger">{t("loadError")}</Text>
          </div>
        )}

        {data && data.events.length === 0 && (
          <Text tone="muted">{t("noResults")}</Text>
        )}

        {data && data.events.length > 0 && (
          <>
            <ul className="m-0 flex list-none flex-col p-0">
              {data.events.map((event) => (
                <ActivityItem key={event.id} event={event} now={now} />
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= FIRST_PAGE}
                onClick={() => setPage(page - 1)}
              >
                {t("newer")}
              </Button>
              <Text size="small" tone="muted">
                {t("pageOf", { page: data.page, totalPages })}
              </Text>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                {t("older")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
