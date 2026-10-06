import { useTranslations } from "next-intl";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import Button from "@/components/form/Button";
import ButtonLink from "@/components/form/ButtonLink";

interface CalculatorActionsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  backHref: string;
  finishLabel: string;
  isSubmitting?: boolean;
  onBack: () => void;
}

export default function CalculatorActions({
  isFirstStep,
  isLastStep,
  backHref,
  finishLabel,
  isSubmitting = false,
  onBack,
}: CalculatorActionsProps) {
  const t = useTranslations("calculator.actions");
  const backIcon = <LuArrowLeft aria-hidden="true" className="size-5" />;
  const forwardIcon = <LuArrowRight aria-hidden="true" className="size-5" />;

  return (
    <div className="flex items-center justify-between gap-3">
      {isFirstStep ? (
        <ButtonLink href={backHref} variant="secondary">
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
        loading={isSubmitting}
      >
        {isLastStep ? finishLabel : t("continue")}
      </Button>
    </div>
  );
}
