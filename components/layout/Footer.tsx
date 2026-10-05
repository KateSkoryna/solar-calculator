import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ground">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 px-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-10 lg:px-20">
        <p>{t("copyright", { currentYear })}</p>
        <p>{t("tagline")}</p>
      </div>
    </footer>
  );
}
