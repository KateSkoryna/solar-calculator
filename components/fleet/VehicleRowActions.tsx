"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/form/Button";
import ButtonLink from "@/components/form/ButtonLink";
import FieldError from "@/components/form/FieldError";
import {
  fleetCalculationsApiPath,
  fleetVehicleApiPath,
} from "@/lib/fleet-api-paths";
import type { FleetVehicleGroup } from "@/lib/fleet-group-status";
import {
  fleetCalculationPath,
  fleetEditVehiclePath,
} from "@/lib/workspace-path";

interface VehicleRowActionsProps {
  group: FleetVehicleGroup;
  fleetId: string;
  fleetSlug: string;
  canEdit: boolean;
  canDelete: boolean;
}

export default function VehicleRowActions({
  group,
  fleetId,
  fleetSlug,
  canEdit,
  canDelete,
}: VehicleRowActionsProps) {
  const t = useTranslations("vehicles.actions");
  const locale = useLocale();
  const router = useRouter();
  const errorId = useId();
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const vehicleName = `${group.manufacturer} ${group.model}`;

  if (!canEdit && !canDelete) return null;

  const runCalculation = async () => {
    setIsRunning(true);
    setHasFailed(false);
    try {
      const response = await fetch(fleetCalculationsApiPath(fleetId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: group.vehicleId }),
      });
      if (!response.ok) throw new Error("Request failed");
      const { calculation } = (await response.json()) as {
        calculation: { id: string };
      };
      router.push(fleetCalculationPath(locale, fleetSlug, calculation.id));
    } catch {
      setHasFailed(true);
      setIsRunning(false);
    }
  };

  const deleteVehicle = async () => {
    setIsDeleting(true);
    setHasFailed(false);
    try {
      const response = await fetch(
        fleetVehicleApiPath(fleetId, group.vehicleId),
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Request failed");
      setIsConfirmingDelete(false);
      router.refresh();
    } catch {
      setHasFailed(true);
      setIsConfirmingDelete(false);
    }
    setIsDeleting(false);
  };

  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      <div className="flex flex-wrap gap-2">
        {canEdit && (
          <>
            <ButtonLink
              href={fleetEditVehiclePath(locale, fleetSlug, group.vehicleId)}
              variant="secondary"
              size="sm"
              aria-label={t("editLabel", { vehicle: vehicleName })}
            >
              {t("edit")}
            </ButtonLink>
            <Button
              size="sm"
              loading={isRunning}
              aria-label={t("runLabel", { vehicle: vehicleName })}
              onClick={runCalculation}
            >
              {t("run")}
            </Button>
          </>
        )}
        {canDelete && (
          <Button
            variant="danger"
            size="sm"
            aria-label={t("deleteLabel", { vehicle: vehicleName })}
            onClick={() => setIsConfirmingDelete(true)}
          >
            {t("delete")}
          </Button>
        )}
      </div>
      {hasFailed && (
        <FieldError id={errorId} announce>
          {t("failed")}
        </FieldError>
      )}
      {isConfirmingDelete && (
        <ConfirmDialog
          title={t("confirmTitle", { vehicle: vehicleName })}
          text={t("confirmText")}
          confirmLabel={t("confirmDelete")}
          cancelLabel={t("cancel")}
          isConfirming={isDeleting}
          onConfirm={deleteVehicle}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
    </div>
  );
}
