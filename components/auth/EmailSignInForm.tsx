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
import { savePendingSignInEmail } from "@/lib/pending-sign-in-email";
import { checkEmailPath } from "@/lib/public-paths";
import { requestSignInLink } from "@/lib/request-sign-in-link";

const emailSignInSchema = z.object({ email: z.email() });

type EmailSignInValues = z.infer<typeof emailSignInSchema>;

interface EmailSignInFormProps {
  linkProblem: string | null;
}

export default function EmailSignInForm({ linkProblem }: EmailSignInFormProps) {
  const t = useTranslations("emailSignIn");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [sendingFailed, setSendingFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailSignInValues>({
    resolver: zodResolver(emailSignInSchema),
    defaultValues: { email: "" },
  });

  const sendLink = handleSubmit(async ({ email }) => {
    setSendingFailed(false);
    const outcome = await requestSignInLink(email, locale);

    if (outcome === "failed") {
      setSendingFailed(true);
      return;
    }

    savePendingSignInEmail(email);
    router.push(checkEmailPath(locale));
  });

  const formProblem = sendingFailed ? tAuth("emailSignInFailed") : linkProblem;

  return (
    <form noValidate onSubmit={sendLink} className="flex flex-1 flex-col gap-5">
      <Input
        {...register("email")}
        type="email"
        autoComplete="email"
        label={t("email")}
        placeholder={t("emailPlaceholder")}
        error={errors.email ? t("invalidEmail") : undefined}
      />
      <div className="mt-auto flex flex-col gap-5 md:mt-0">
        {formProblem && (
          <FormAlert
            action={
              linkProblem && !sendingFailed ? (
                <Button
                  variant="dark"
                  size="sm"
                  type="button"
                  onClick={sendLink}
                >
                  {t("sendNewLink")}
                </Button>
              ) : undefined
            }
          >
            {formProblem}
          </FormAlert>
        )}
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? t("sending") : t("submitButton")}
        </Button>
      </div>
    </form>
  );
}
