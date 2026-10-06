"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/form/Button";
import FieldError from "@/components/form/FieldError";
import { fleetVehicleApiPath } from "@/lib/fleet-api-paths";
import { fleetVehiclesPath } from "@/lib/workspace-path";

interface DeleteVehicleButtonProps {
  fleetId: string;
  fleetSlug: string;
  vehicleId: string;
  vehicleName: string;
}

export default function DeleteVehicleButton({
  fleetId,
  fleetSlug,
  vehicleId,
  vehicleName,
}: DeleteVehicleButtonProps) {
  const t = useTranslations("vehicles.edit.delete");
  const locale = useLocale();
  const router = useRouter();
  const errorId = useId();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const deleteVehicle = async () => {
    setIsDeleting(true);
    setHasFailed(false);
    try {
      const response = await fetch(fleetVehicleApiPath(fleetId, vehicleId), {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Request failed");
      router.push(fleetVehiclesPath(locale, fleetSlug));
      router.refresh();
    } catch {
      setHasFailed(true);
      setIsConfirming(false);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="danger" onClick={() => setIsConfirming(true)}>
        {t("button")}
      </Button>
      {hasFailed && (
        <FieldError id={errorId} announce>
          {t("failed")}
        </FieldError>
      )}
      {isConfirming && (
        <ConfirmDialog
          title={t("confirmTitle", { vehicle: vehicleName })}
          text={t("confirmText")}
          confirmLabel={t("confirm")}
          cancelLabel={t("cancel")}
          isConfirming={isDeleting}
          onConfirm={deleteVehicle}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </div>
  );
}
