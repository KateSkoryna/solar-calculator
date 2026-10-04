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
        <h1 className="mb-0 font-display text-[32px] font-extrabold text-ink md:text-[40px]">
          {title}
        </h1>
        <p className="text-[17px] text-muted">{intro}</p>
      </header>
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="mb-0 font-display text-[22px] font-bold text-ink">
            {section.title}
          </h2>
          <p className="text-base leading-relaxed text-ink">{section.body}</p>
        </section>
      ))}
    </article>
  );
}
