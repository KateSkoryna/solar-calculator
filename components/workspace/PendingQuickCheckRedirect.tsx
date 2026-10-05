"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  clearPendingQuickCheck,
  readPendingQuickCheck,
} from "@/lib/pending-quick-check";

const SERVER_ERROR_STATUS = 500;

interface PendingQuickCheckRedirectProps {
  fleetId: string;
  fleetPath: string;
  overviewPath: string;
}

export default function PendingQuickCheckRedirect({
  fleetId,
  fleetPath,
  overviewPath,
}: PendingQuickCheckRedirectProps) {
  const t = useTranslations("workspace");
  const router = useRouter();

  useEffect(() => {
    const pendingQuickCheck = readPendingQuickCheck();

    if (!pendingQuickCheck) {
      clearPendingQuickCheck();
      router.replace(overviewPath);
      return;
    }

    let isCancelled = false;

    async function savePendingQuickCheck() {
      try {
        const response = await fetch(`/api/fleets/${fleetId}/quick-checks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingQuickCheck),
        });

        if (!response.ok) {
          if (response.status < SERVER_ERROR_STATUS) clearPendingQuickCheck();
          throw new Error("Saving the quick check failed");
        }

        const { calculation } = await response.json();
        clearPendingQuickCheck();
        if (!isCancelled) {
          router.replace(`${fleetPath}/calculations/${calculation.id}`);
        }
      } catch {
        if (!isCancelled) router.replace(overviewPath);
      }
    }

    savePendingQuickCheck();

    return () => {
      isCancelled = true;
    };
  }, [fleetId, fleetPath, overviewPath, router]);

  return <p className="p-6 text-center">{t("savingQuickCheck")}</p>;
}
