import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";

interface NumberedStepCardProps {
  stepNumber: number;
  title: string;
  body: string;
}

export default function NumberedStepCard({
  stepNumber,
  title,
  body,
}: NumberedStepCardProps) {
  return (
    <li className="mb-0 flex gap-4 rounded-lg border border-line bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-hover lg:flex-col lg:p-8">
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-soft font-display text-lg font-bold text-ink"
      >
        {stepNumber}
      </span>
      <div className="flex flex-col gap-1.5">
        <Heading level={3} size="heading">
          {title}
        </Heading>
        <Text tone="muted">{body}</Text>
      </div>
    </li>
  );
}
