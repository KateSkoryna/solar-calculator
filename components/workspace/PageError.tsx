"use client";

import { useTranslations } from "next-intl";
import Card from "@/components/common/Card";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import Button from "@/components/form/Button";

interface PageErrorProps {
  messageKey: string;
  onRetry: () => void;
}

export default function PageError({ messageKey, onRetry }: PageErrorProps) {
  const t = useTranslations(messageKey);

  return (
    <Card as="section" className="flex flex-col items-start gap-4">
      <Heading level={2} size="title">
        {t("title")}
      </Heading>
      <Text tone="muted">{t("text")}</Text>
      <Button size="sm" onClick={onRetry}>
        {t("retry")}
      </Button>
    </Card>
  );
}
