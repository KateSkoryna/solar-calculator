import type { ReactNode } from "react";
import Card from "@/components/common/Card";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import PageContainer from "@/components/layout/PageContainer";

interface ResultsNoticeProps {
  title: string;
  text: string;
  children?: ReactNode;
}

export default function ResultsNotice({
  title,
  text,
  children,
}: ResultsNoticeProps) {
  return (
    <PageContainer className="py-10 md:py-16">
      <Card className="mx-auto flex max-w-[640px] flex-col items-start gap-4 text-left">
        <Heading level={1} size="display-s">
          {title}
        </Heading>
        <Text tone="muted">{text}</Text>
        {children}
      </Card>
    </PageContainer>
  );
}
