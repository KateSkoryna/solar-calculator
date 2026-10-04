import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";

interface LegalDocumentSection {
  title: string;
  body: string;
}

interface LegalDocumentProps {
  title: string;
  intro: string;
  sections: LegalDocumentSection[];
}

export default function LegalDocument({
  title,
  intro,
  sections,
}: LegalDocumentProps) {
  return (
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 py-10 text-left md:px-10 md:py-14">
      <header className="flex flex-col gap-3">
        <Heading level={1} size="display-s">
          {title}
        </Heading>
        <Text size="body-l" tone="muted">
          {intro}
        </Text>
      </header>
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <Heading level={2} size="title">
            {section.title}
          </Heading>
          <Text>{section.body}</Text>
        </section>
      ))}
    </article>
  );
}
