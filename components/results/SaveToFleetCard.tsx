"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Card from "@/components/common/Card";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import Button from "@/components/form/Button";
import FieldError from "@/components/form/FieldError";
import {
  FLEETS_API_PATH,
  fleetQuickChecksApiPath,
} from "@/lib/fleet-api-paths";
import { savePendingQuickCheck } from "@/lib/pending-quick-check";
import { registerPath } from "@/lib/public-paths";
import type { QuickCheckAnswers } from "@/lib/quick-check-schema";
import type { InputKey } from "@/lib/results-view-model";
import { fleetCalculationPath, workspacePath } from "@/lib/workspace-path";

const SIGNED_IN_STATUS = "authenticated";
const SESSION_LOADING_STATUS = "loading";

interface FleetSummary {
  id: string;
  slug: string;
}

async function readJson<Body>(response: Response): Promise<Body> {
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

async function saveToFirstFleet(answers: QuickCheckAnswers) {
  const { fleets } = await readJson<{ fleets: FleetSummary[] }>(
    await fetch(FLEETS_API_PATH),
  );
  const [firstFleet] = fleets;
  if (!firstFleet) return null;

  const { calculation } = await readJson<{ calculation: { id: string } }>(
    await fetch(fleetQuickChecksApiPath(firstFleet.id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    }),
  );

  return { fleetSlug: firstFleet.slug, calculationId: calculation.id };
}

interface SaveToFleetCardProps {
  answers: QuickCheckAnswers;
  typicalValueInputs?: InputKey[];
}

export default function SaveToFleetCard({
  answers,
  typicalValueInputs = [],
}: SaveToFleetCardProps) {
  const t = useTranslations("results.save");
  const translateInput = useTranslations("results.howWeCalculated.inputs");
  const usedTypicalValues = typicalValueInputs.length > 0;
  const locale = useLocale();
  const router = useRouter();
  const { status } = useSession();
  const errorId = useId();
  const [isSaving, setIsSaving] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const continueAfterSignUp = (nextPath: string) => {
    savePendingQuickCheck(answers);
    router.push(nextPath);
  };

  const saveResult = async () => {
    if (status !== SIGNED_IN_STATUS) {
      continueAfterSignUp(registerPath(locale));
      return;
    }

    setIsSaving(true);
    setHasFailed(false);
    try {
      const saved = await saveToFirstFleet(answers);
      if (saved === null) {
        continueAfterSignUp(workspacePath(locale));
        return;
      }
      router.push(
        fleetCalculationPath(locale, saved.fleetSlug, saved.calculationId),
      );
    } catch {
      setHasFailed(true);
      setIsSaving(false);
    }
  };

  return (
    <Card
      as="section"
      tone="lime-soft"
      className="flex flex-col items-start gap-3 text-left"
    >
      <Heading level={2} size="heading" className="!text-lime-soft-ink">
        {usedTypicalValues ? t("preciseTitle") : t("title")}
      </Heading>
      {usedTypicalValues && (
        <>
          <Text className="!text-lime-soft-ink">{t("presetIntro")}</Text>
          <ul className="flex flex-col gap-1 pl-1">
            {typicalValueInputs.map((inputKey) => (
              <Text
                key={inputKey}
                as="li"
                className="mb-0 font-semibold !text-lime-soft-ink"
              >
                {translateInput(inputKey)}
              </Text>
            ))}
          </ul>
        </>
      )}
      <Text className="!text-lime-soft-ink">
        {usedTypicalValues ? t("preciseText") : t("text")}
      </Text>
      <Button
        variant="dark"
        loading={isSaving}
        disabled={status === SESSION_LOADING_STATUS}
        aria-describedby={hasFailed ? errorId : undefined}
        onClick={saveResult}
      >
        {t("button")}
      </Button>
      {hasFailed && (
        <FieldError id={errorId} announce>
          {t("failed")}
        </FieldError>
      )}
    </Card>
  );
}
