import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Disclosure from "@/components/common/Disclosure";

interface ExactNumbersDisclosureProps {
  children: ReactNode;
}

export default function ExactNumbersDisclosure({
  children,
}: ExactNumbersDisclosureProps) {
  const t = useTranslations("calculator.exactNumbers");
  return (
    <Disclosure summary={t("summary")}>
      <div className="grid gap-5 pt-1 md:grid-cols-2">{children}</div>
    </Disclosure>
  );
}
