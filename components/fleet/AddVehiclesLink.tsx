import { useTranslations } from "next-intl";
import { LuPlus } from "react-icons/lu";
import ButtonLink from "@/components/form/ButtonLink";

interface AddVehiclesLinkProps {
  href: string;
}

export default function AddVehiclesLink({ href }: AddVehiclesLinkProps) {
  const t = useTranslations("overview");

  return (
    <ButtonLink
      href={href}
      size="sm"
      icon={<LuPlus aria-hidden="true" className="size-4" />}
    >
      {t("addVehicles")}
    </ButtonLink>
  );
}
