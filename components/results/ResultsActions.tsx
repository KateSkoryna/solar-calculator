"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LuLink } from "react-icons/lu";
import Button from "@/components/form/Button";
import ButtonLink from "@/components/form/ButtonLink";
import { calculatorPath } from "@/lib/public-paths";

type ShareStatus = "idle" | "copied" | "failed";

const SHARE_STATUS_MESSAGE_KEYS = {
  copied: "linkCopied",
  failed: "linkCopyFailed",
} as const;

export default function ResultsActions() {
  const t = useTranslations("results.actions");
  const locale = useLocale();
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("copied");
    } catch {
      setShareStatus("failed");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href={calculatorPath(locale)} variant="secondary" size="sm">
          {t("changeAnswers")}
        </ButtonLink>
        <Button
          variant="secondary"
          size="sm"
          icon={<LuLink aria-hidden="true" className="size-4" />}
          onClick={copyLink}
        >
          {t("shareLink")}
        </Button>
      </div>
      <p
        aria-live="polite"
        className="text-right text-sm text-muted empty:hidden"
      >
        {shareStatus === "idle"
          ? ""
          : t(SHARE_STATUS_MESSAGE_KEYS[shareStatus])}
      </p>
    </div>
  );
}
