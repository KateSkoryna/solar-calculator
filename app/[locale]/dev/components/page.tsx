import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { LuArrowRight } from "react-icons/lu";
import { ReportJobStatus, Role } from "@/app/generated/prisma/enums";
import Avatar, { AVATAR_TONES } from "@/components/common/Avatar";
import Badge from "@/components/common/Badge";
import Card, { CARD_TONES } from "@/components/common/Card";
import Disclosure from "@/components/common/Disclosure";
import Heading from "@/components/common/Heading";
import Logo from "@/components/common/Logo";
import ProgressBar from "@/components/common/ProgressBar";
import RolePill from "@/components/common/RolePill";
import StatusPill from "@/components/common/StatusPill";
import Text from "@/components/common/Text";
import Button from "@/components/form/Button";
import ButtonLink from "@/components/form/ButtonLink";
import Input from "@/components/form/Input";
import PageContainer from "@/components/layout/PageContainer";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "@/lib/button-styles";

const SAMPLE_REPORT_PROGRESS = 66;
const SAMPLE_STEP_PROGRESS = 2;
const SAMPLE_STEP_COUNT = 4;
const SAMPLE_LINK_TARGET = "/calculator";

function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <Heading level={2} size="title">
        {title}
      </Heading>
      {children}
    </section>
  );
}

export default function ComponentShowcasePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const t = useTranslations("devShowcase");
  const forwardIcon = <LuArrowRight aria-hidden="true" className="size-5" />;

  return (
    <PageContainer className="flex flex-col gap-12 py-10">
      <header className="flex flex-col gap-2">
        <Heading level={1} size="display-s">
          {t("title")}
        </Heading>
        <Text tone="muted">{t("intro")}</Text>
      </header>

      <ShowcaseSection title={t("sections.button")}>
        {BUTTON_SIZES.map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-3">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} size={size}>
                {t("buttonLabel")}
              </Button>
            ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={forwardIcon} iconPosition="end">
            {t("buttonWithIcon")}
          </Button>
          <Button loading>{t("buttonLoading")}</Button>
          <Button disabled>{t("buttonDisabled")}</Button>
          <Button variant="secondary" disabled>
            {t("buttonDisabled")}
          </Button>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.buttonLink")}>
        <div className="flex flex-wrap items-center gap-3">
          {BUTTON_VARIANTS.map((variant) => (
            <ButtonLink
              key={variant}
              href={SAMPLE_LINK_TARGET}
              variant={variant}
              icon={forwardIcon}
            >
              {t("linkLabel")}
            </ButtonLink>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.card")}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CARD_TONES.map((tone) => (
            <Card
              key={tone}
              as="article"
              tone={tone}
              title={t("cardTitle")}
              action={<Badge variant="sample">{t("cardAction")}</Badge>}
            >
              <p>{t("cardBody")}</p>
            </Card>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.input")}>
        <div className="grid gap-5 md:grid-cols-3">
          <Input label={t("inputLabel")} placeholder={t("inputPlaceholder")} />
          <Input
            label={t("inputLabel")}
            placeholder={t("inputPlaceholder")}
            hint={t("inputHint")}
          />
          <Input
            label={t("inputLabel")}
            placeholder={t("inputPlaceholder")}
            hint={t("inputHint")}
            error={t("inputError")}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.logo")}>
        <div className="flex flex-wrap items-center gap-6">
          <Logo />
          <span className="rounded-lg bg-forest p-5">
            <Logo onDark />
          </span>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.badge")}>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="sample">{t("sampleBadge")}</Badge>
          <Badge variant="info">{t("infoBadge")}</Badge>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.rolePill")}>
        <div className="flex flex-wrap items-center gap-3">
          {Object.values(Role).map((role) => (
            <RolePill key={role} role={role} />
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.statusPill")}>
        <div className="flex flex-wrap items-center gap-3">
          {Object.values(ReportJobStatus).map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.avatar")}>
        <div className="flex flex-wrap items-center gap-3">
          {AVATAR_TONES.map((tone) => (
            <Avatar key={tone} name={t("avatarName")} tone={tone} />
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.progressBar")}>
        <div className="grid gap-5 md:grid-cols-2">
          <ProgressBar
            value={SAMPLE_REPORT_PROGRESS}
            label={t("progressReportLabel")}
          />
          <ProgressBar
            value={SAMPLE_STEP_PROGRESS}
            max={SAMPLE_STEP_COUNT}
            tone="step"
            label={t("progressStepLabel")}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={t("sections.disclosure")}>
        <Disclosure summary={t("disclosureSummary")}>
          <p className="text-muted">{t("disclosureBody")}</p>
        </Disclosure>
      </ShowcaseSection>
    </PageContainer>
  );
}
