import { useLocale, useTranslations } from "next-intl";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import Button from "@/components/form/Button";
import ButtonLink from "@/components/form/ButtonLink";
import { homePath } from "@/lib/public-paths";

interface CalculatorActionsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onBack: () => void;
}

export default function CalculatorActions({
  isFirstStep,
  isLastStep,
  onBack,
}: CalculatorActionsProps) {
  const t = useTranslations("calculator.actions");
  const locale = useLocale();
  const backIcon = <LuArrowLeft aria-hidden="true" className="size-5" />;
  const forwardIcon = <LuArrowRight aria-hidden="true" className="size-5" />;

  return (
    <div className="flex items-center justify-between gap-3">
      {isFirstStep ? (
        <ButtonLink href={homePath(locale)} variant="secondary">
          {t("back")}
        </ButtonLink>
      ) : (
        <Button variant="secondary" icon={backIcon} onClick={onBack}>
          {t("back")}
        </Button>
      )}
      <Button
        type="submit"
        variant={isLastStep ? "dark" : "primary"}
        icon={forwardIcon}
        iconPosition="end"
      >
        {isLastStep ? t("seeResults") : t("continue")}
      </Button>
    </div>
  );
}
