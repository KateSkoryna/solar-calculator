"use client";

import { useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LuMailCheck } from "react-icons/lu";
import { useCountdown } from "@/components/auth/useCountdown";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import Button from "@/components/form/Button";
import ButtonLink from "@/components/form/ButtonLink";
import FormAlert from "@/components/form/FormAlert";
import { readPendingSignInEmail } from "@/lib/pending-sign-in-email";
import { loginPath } from "@/lib/public-paths";
import { requestSignInLink } from "@/lib/request-sign-in-link";
import {
  SIGN_IN_LINK_MAX_AGE_MINUTES,
  SIGN_IN_LINK_RESEND_DELAY_SECONDS,
} from "@/lib/sign-in-link-lifetime";

type ResendStatus = "idle" | "sending" | "sent" | "failed";

function subscribeToNothing() {
  return () => {};
}

export default function CheckEmailPanel() {
  const t = useTranslations("checkEmail");
  const locale = useLocale();
  const email = useSyncExternalStore(
    subscribeToNothing,
    readPendingSignInEmail,
    () => null,
  );
  const { remainingSeconds, restart } = useCountdown(
    SIGN_IN_LINK_RESEND_DELAY_SECONDS,
  );
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const canResend =
    email !== null && remainingSeconds <= 0 && resendStatus !== "sending";

  const resend = async () => {
    if (email === null) return;

    setResendStatus("sending");
    const outcome = await requestSignInLink(email, locale);
    setResendStatus(outcome === "sent" ? "sent" : "failed");
    if (outcome === "sent") restart();
  };

  return (
    <div className="flex flex-1 flex-col gap-6 text-left">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-lime-soft text-lime-soft-ink"
      >
        <LuMailCheck className="size-7" />
      </span>
      <div className="flex flex-col gap-3">
        <Heading level={1} size="display-s">
          {t("title")}
        </Heading>
        <Text size="body-l" tone="muted">
          {email === null
            ? t("messageUnknownAddress", {
                minutes: SIGN_IN_LINK_MAX_AGE_MINUTES,
              })
            : t("message", {
                email,
                minutes: SIGN_IN_LINK_MAX_AGE_MINUTES,
              })}
        </Text>
        <Text size="small" tone="muted">
          {t("spamHint")}
        </Text>
      </div>
      {resendStatus === "failed" && <FormAlert>{t("resendFailed")}</FormAlert>}
      <div className="mt-auto flex flex-col gap-3 md:mt-0">
        <Button
          variant="dark"
          size="lg"
          fullWidth
          disabled={!canResend}
          loading={resendStatus === "sending"}
          onClick={resend}
        >
          {remainingSeconds > 0
            ? t("resendIn", { seconds: remainingSeconds })
            : t("resend")}
        </Button>
        <p
          aria-live="polite"
          className="text-center text-sm text-muted empty:hidden"
        >
          {resendStatus === "sent" ? t("resent") : ""}
        </p>
        <ButtonLink href={loginPath(locale)} variant="ghost" fullWidth>
          {t("differentEmail")}
        </ButtonLink>
      </div>
    </div>
  );
}
