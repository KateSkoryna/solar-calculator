"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_AUDIT_EVENT_PAGE_SIZE } from "@/lib/audit-event-constants";

interface User {
  id: string;
  email: string;
}

interface AuditEventRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorUser: { email: string } | null;
  createdAt: string;
}

interface AuditEventsResponse {
  events: AuditEventRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface AuditLogViewProps {
  fleetId: string;
  users: User[];
  entityTypes: string[];
}

function toStartOfLocalDayISOString(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toISOString();
}

function toEndOfLocalDayISOString(dateString: string) {
  return new Date(`${dateString}T23:59:59.999`).toISOString();
}

export default function AuditLogView({
  fleetId,
  users,
  entityTypes,
}: AuditLogViewProps) {
  const t = useTranslations("audit");
  const tCalculator = useTranslations("calculator");
  const tAuth = useTranslations("auth");

  const [actorUserId, setActorUserId] = useState("");
  const [entityType, setEntityType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams({
    page: String(page),
    pageSize: String(DEFAULT_AUDIT_EVENT_PAGE_SIZE),
    ...(actorUserId && { actorUserId }),
    ...(entityType && { entityType }),
    ...(from && { from: toStartOfLocalDayISOString(from) }),
    ...(to && { to: toEndOfLocalDayISOString(to) }),
  });

  const { data, isLoading, isError, error } = useQuery<AuditEventsResponse>({
    queryKey: [
      "audit-events",
      fleetId,
      actorUserId,
      entityType,
      from,
      to,
      page,
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/fleets/${fleetId}/audit-events?${queryParams.toString()}`,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? t("loadError"));
      }

      return response.json();
    },
  });

  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalCount / data.pageSize))
    : 1;

  function applyFilter(setFilter: (value: string) => void, value: string) {
    setFilter(value);
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-body)]">
            {t("user")}
          </label>
          <select
            value={actorUserId}
            onChange={(e) => applyFilter(setActorUserId, e.target.value)}
            className="w-full rounded-md bg-[var(--input)] p-3 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
          >
            <option value="">{t("allUsers")}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-body)]">
            {t("entityType")}
          </label>
          <select
            value={entityType}
            onChange={(e) => applyFilter(setEntityType, e.target.value)}
            className="w-full rounded-md bg-[var(--input)] p-3 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
          >
            <option value="">{t("allTypes")}</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-body)]">
            {t("from")}
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => applyFilter(setFrom, e.target.value)}
            className="w-full rounded-md bg-[var(--input)] p-3 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-body)]">
            {t("to")}
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => applyFilter(setTo, e.target.value)}
            className="w-full rounded-md bg-[var(--input)] p-3 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-center text-[var(--text-body)]">
          {tAuth("loading")}
        </p>
      )}
      {isError && (
        <p className="text-center text-red-500">
          {error instanceof Error ? error.message : t("loadError")}
        </p>
      )}

      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-body)]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-2 pr-4">{t("timestamp")}</th>
                  <th className="py-2 pr-4">{t("user")}</th>
                  <th className="py-2 pr-4">{t("action")}</th>
                  <th className="py-2 pr-4">{t("entity")}</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-[var(--border)]"
                  >
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">
                      {event.actorUser?.email ?? "—"}
                    </td>
                    <td className="py-2 pr-4">{event.action}</td>
                    <td className="py-2 pr-4">
                      {event.entityType} / {event.entityId}
                    </td>
                  </tr>
                ))}
                {data.events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center">
                      {t("noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[var(--text-body)] disabled:opacity-40"
            >
              {tCalculator("previous")}
            </button>
            <span className="text-sm text-[var(--text-body)]">
              {t("pageOf", { page: data.page, totalPages })}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[var(--text-body)] disabled:opacity-40"
            >
              {tCalculator("next")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
