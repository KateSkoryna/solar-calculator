import type { IconType } from "react-icons";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";

interface IconFeatureProps {
  Icon: IconType;
  title: string;
  body: string;
}

export default function IconFeature({ Icon, title, body }: IconFeatureProps) {
  return (
    <li className="mb-0 flex gap-4 md:flex-col md:gap-3">
      <Icon
        aria-hidden="true"
        className="size-9 shrink-0 stroke-[1.5] text-lime"
      />
      <div className="flex flex-col gap-1">
        <Heading level={3} size="heading" tone="on-dark">
          {title}
        </Heading>
        <Text tone="on-dark-muted">{body}</Text>
      </div>
    </li>
  );
}
