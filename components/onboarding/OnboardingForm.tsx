"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/form/Button";
import FormAlert from "@/components/form/FormAlert";
import Input from "@/components/form/Input";
import { FLEETS_API_PATH } from "@/lib/fleet-api-paths";
import { workspacePath } from "@/lib/workspace-path";

const MAX_NAME_LENGTH = 80;
const MIN_COMPANY_NAME_LENGTH = 2;

const onboardingSchema = z.object({
  userName: z.string().trim().max(MAX_NAME_LENGTH),
  companyName: z
    .string()
    .trim()
    .min(MIN_COMPANY_NAME_LENGTH)
    .max(MAX_NAME_LENGTH),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingForm() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const [hasSavingFailed, setHasSavingFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { userName: "", companyName: "" },
    mode: "onBlur",
  });

  const createWorkspace = handleSubmit(async ({ userName, companyName }) => {
    setHasSavingFailed(false);

    try {
      const response = await fetch(FLEETS_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, userName: userName || undefined }),
      });
      if (!response.ok) throw new Error("Fleet creation failed");
    } catch {
      setHasSavingFailed(true);
      return;
    }

    router.push(workspacePath(locale));
  });

  return (
    <form
      noValidate
      onSubmit={createWorkspace}
      className="flex flex-1 flex-col gap-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          {...register("userName")}
          autoComplete="name"
          maxLength={MAX_NAME_LENGTH}
          label={t("userName")}
        />
        <Input
          {...register("companyName")}
          autoComplete="organization"
          maxLength={MAX_NAME_LENGTH}
          label={t("companyName")}
          error={errors.companyName ? t("companyRequired") : undefined}
        />
      </div>
      <div className="mt-auto flex flex-col gap-5 md:mt-0">
        {hasSavingFailed && <FormAlert>{t("error")}</FormAlert>}
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? t("saving") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
