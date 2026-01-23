import Link from "next/link";
import ClientMenu from "./ClientMenu";
import { useTranslations } from "next-intl";
import Container from "./Container";

export default function Header() {
  const t = useTranslations("header");
  return (
    <header className="border-b-1 border-[color:var(--border)]">
      <Container>
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <ul className="hidden md:flex items-center gap-6">
              <li>
                <Link
                  href="/"
                  className="text-[color:var(--text-body)] hover:text-[color:var(--text-heading)]"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="text-[color:var(--text-body)] hover:text-[color:var(--text-heading)]"
                >
                  {t("calculator")}
                </Link>
              </li>
            </ul>
          </div>

          <ClientMenu />
        </nav>
      </Container>
    </header>
  );
}
