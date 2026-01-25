import Container from "@/components/layout/Container";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <Container>
      <div className="mx-auto max-w-4xl text-center py-4">
        <h1 className="text-[var(--text-heading)]">{t("title")}</h1>

        <p className="mb-8 text-xl font-[family:var(--font-inter)] text-[var(--text-body)]">
          {t("description")}
        </p>
      </div>
    </Container>
  );
}
