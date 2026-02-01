"use client";

import { useTranslations } from "next-intl";
import Textarea from "@/components/form/Textarea";

export default function UserPromptStep() {
  const t = useTranslations("calculator");

  return (
    <div className="space-y-3">
      <Textarea
        name="additionalNotes"
        label={t("additionalNotes")}
        placeholder={t("notesPlaceholder")}
      />
    </div>
  );
}
