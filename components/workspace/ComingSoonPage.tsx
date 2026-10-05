import { useTranslations } from "next-intl";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import {
  WORKSPACE_NAV_MESSAGE_NAMESPACE,
  type WorkspaceNavItem,
} from "@/lib/workspace-nav";

interface ComingSoonPageProps {
  navMessageKey: WorkspaceNavItem["messageKey"];
}

export default function ComingSoonPage({ navMessageKey }: ComingSoonPageProps) {
  const tNav = useTranslations(WORKSPACE_NAV_MESSAGE_NAMESPACE);
  const t = useTranslations("workspace");

  return (
    <div className="flex flex-col gap-3">
      <Heading level={1} size="display-s">
        {tNav(navMessageKey)}
      </Heading>
      <Text size="body-l" tone="muted">
        {t("comingSoon")}
      </Text>
    </div>
  );
}
